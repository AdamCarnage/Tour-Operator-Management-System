import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { ORGANIZATION_ROLE_NAMES, RoleName } from '../../../common/enums';
import { isDatabaseConflict } from '../../../common/errors';
import { findOwned, pageWindow, paginate } from '../../../common/pagination';
import { ROLE_PERMISSIONS } from '../domain/permissions';
import { Organization, Role, User } from '../infrastructure/identity.entities';
import { hashPassword } from '../infrastructure/password.hasher';
import type { CreateUserDto, UpdateUserDto } from '../api/identity.dto';
import { toUserResponse } from './identity.mapper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Organization)
    private readonly organizations: Repository<Organization>,
  ) {}

  async findByEmailWithSecrets(email: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .addSelect('user.refreshTokenHash')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async findByIdWithSecrets(id: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id })
      .getOne();
  }

  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  async setRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
    await this.users.update(userId, { refreshTokenHash });
  }

  list(organizationId: string, page?: number, limit?: number) {
    return paginate(this.users, organizationId, page, limit);
  }

  async listForActor(actor: AuthUser, page?: number, limit?: number) {
    if (actor.role === RoleName.PlatformAdmin) {
      return this.listAll(page, limit);
    }
    const pageResult = await this.list(actor.organizationId, page, limit);
    return {
      ...pageResult,
      data: pageResult.data.map((user) => toUserResponse(user)),
    };
  }

  async listAll(page?: number, limit?: number) {
    const window = pageWindow(page, limit);
    const [rows, total] = await this.users.findAndCount({
      order: { createdAt: 'DESC' },
      skip: window.skip,
      take: window.limit,
    });
    const organizationIds = [...new Set(rows.map((row) => row.organizationId))];
    const organizations =
      organizationIds.length === 0
        ? []
        : await this.organizations.find({
            where: { id: In(organizationIds) },
          });
    const byId = new Map(
      organizations.map((organization) => [organization.id, organization]),
    );
    return {
      data: rows.map((user) =>
        toUserResponse(user, byId.get(user.organizationId) ?? null),
      ),
      meta: { page: window.page, limit: window.limit, total },
    };
  }

  get(organizationId: string, id: string) {
    return findOwned(this.users, organizationId, id, 'User');
  }

  async getForActor(actor: AuthUser, id: string) {
    if (actor.role === RoleName.PlatformAdmin) {
      const user = await this.users.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    }
    return this.get(actor.organizationId, id);
  }

  getOrganization(organizationId: string) {
    return this.organizations.findOneByOrFail({ id: organizationId });
  }

  async listRoles(organizationId: string, actor?: AuthUser) {
    const rows = await this.roles.find({
      where: { organizationId },
      order: { name: 'ASC' },
    });
    if (actor?.role === RoleName.PlatformAdmin) {
      return rows;
    }
    return rows.filter((role) => role.name !== RoleName.PlatformAdmin);
  }

  async create(actor: AuthUser, dto: CreateUserDto) {
    this.assertCanGrant(actor, dto.role);
    try {
      return await this.users.save(
        this.users.create({
          organizationId: actor.organizationId,
          email: dto.email.toLowerCase(),
          passwordHash: await hashPassword(dto.password),
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role,
          active: true,
          refreshTokenHash: null,
        }),
      );
    } catch (error) {
      if (isDatabaseConflict(error)) {
        throw new ConflictException('A user with this email already exists');
      }
      throw error;
    }
  }

  async update(actor: AuthUser, id: string, dto: UpdateUserDto) {
    const user = await this.getForActor(actor, id);
    if (user.role === RoleName.PlatformAdmin && actor.role !== RoleName.PlatformAdmin) {
      throw new ForbiddenException('Platform admin accounts cannot be changed here');
    }
    if (dto.role) {
      this.assertCanGrant(actor, dto.role);
    }
    if (dto.active === false) {
      if (user.id === actor.userId) {
        throw new BadRequestException('You cannot deactivate your own user');
      }
      await this.assertOwnerRemains(user, false);
    }
    if (dto.role && dto.role !== RoleName.Owner) {
      await this.assertOwnerRemains(user, true);
    }
    Object.assign(user, {
      firstName: dto.firstName ?? user.firstName,
      lastName: dto.lastName ?? user.lastName,
      role: dto.role ?? user.role,
      active: dto.active ?? user.active,
    });
    return this.users.save(user);
  }

  async seedRoles(
    managerRoles: Repository<Role>,
    organizationId: string,
  ): Promise<void> {
    const rows = ORGANIZATION_ROLE_NAMES.map((name) =>
      managerRoles.create({
        organizationId,
        name,
        permissions: [...ROLE_PERMISSIONS[name]],
      }),
    );
    await managerRoles.save(rows);
  }

  private assertCanGrant(actor: AuthUser, role: RoleName) {
    if (role === RoleName.PlatformAdmin) {
      throw new ForbiddenException(
        'The platform admin role cannot be granted from an organization',
      );
    }
    if (
      role === RoleName.Owner &&
      actor.role !== RoleName.Owner &&
      actor.role !== RoleName.PlatformAdmin
    ) {
      throw new ForbiddenException('Only an owner can grant the owner role');
    }
  }

  private async assertOwnerRemains(user: User, changingRole: boolean) {
    if (user.role !== RoleName.Owner) {
      return;
    }
    const owners = await this.users.count({
      where: {
        organizationId: user.organizationId,
        role: RoleName.Owner,
        active: true,
      },
    });
    if (owners <= 1 && (changingRole || user.active)) {
      throw new BadRequestException(
        'The organization must keep an active owner',
      );
    }
  }
}
