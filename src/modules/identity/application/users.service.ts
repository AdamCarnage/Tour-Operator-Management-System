import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { RoleName } from '../../../common/enums';
import { isDatabaseConflict } from '../../../common/errors';
import { findOwned, paginate } from '../../../common/pagination';
import { ROLE_PERMISSIONS } from '../domain/permissions';
import { Organization, Role, User } from '../infrastructure/identity.entities';
import { hashPassword } from '../infrastructure/password.hasher';
import type { CreateUserDto, UpdateUserDto } from '../api/identity.dto';

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

  get(organizationId: string, id: string) {
    return findOwned(this.users, organizationId, id, 'User');
  }

  getOrganization(organizationId: string) {
    return this.organizations.findOneByOrFail({ id: organizationId });
  }

  listRoles(organizationId: string) {
    return this.roles.find({
      where: { organizationId },
      order: { name: 'ASC' },
    });
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
    const user = await this.get(actor.organizationId, id);
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
    const rows = Object.values(RoleName).map((name) =>
      managerRoles.create({
        organizationId,
        name,
        permissions: [...ROLE_PERMISSIONS[name]],
      }),
    );
    await managerRoles.save(rows);
  }

  private assertCanGrant(actor: AuthUser, role: RoleName) {
    if (role === RoleName.Owner && actor.role !== RoleName.Owner) {
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
