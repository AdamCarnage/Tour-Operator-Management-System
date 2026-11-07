import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { SignOptions } from 'jsonwebtoken';
import { DataSource, Repository } from 'typeorm';
import type { AccessTokenPayload } from '../../../common/auth-user';
import { RoleName } from '../../../common/enums';
import { isDatabaseConflict } from '../../../common/errors';
import type { AppEnv } from '../../../config/env.schema';
import { slugify } from '../domain/slug';
import { Organization, Role, User } from '../infrastructure/identity.entities';
import {
  hashPassword,
  verifyPassword,
} from '../infrastructure/password.hasher';
import { hashSecret, newSecret } from '../infrastructure/token.hasher';
import type { LoginDto, RefreshDto, RegisterDto } from '../api/identity.dto';
import { toOrganizationResponse, toUserResponse } from './identity.mapper';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppEnv, true>,
    private readonly users: UsersService,
    @InjectRepository(Organization)
    private readonly organizations: Repository<Organization>,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await hashPassword(dto.password);
    const email = dto.email.toLowerCase();
    try {
      return await this.dataSource.transaction(async (manager) => {
        const slug = await this.uniqueSlug(dto.organizationName);
        const organization = await manager.save(
          manager.create(Organization, {
            name: dto.organizationName,
            slug,
          }),
        );
        await this.users.seedRoles(
          manager.getRepository(Role),
          organization.id,
        );
        const user = await manager.save(
          manager.create(User, {
            organizationId: organization.id,
            email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: RoleName.Owner,
            active: true,
            refreshTokenHash: null,
          }),
        );
        const tokens = await this.issueTokens(user);
        await manager.update(User, user.id, {
          refreshTokenHash: hashSecret(tokens.refreshToken),
        });
        return {
          ...tokens,
          user: toUserResponse(user),
          organization: toOrganizationResponse(organization),
        };
      });
    } catch (error) {
      if (isDatabaseConflict(error)) {
        throw new ConflictException('A user with this email already exists');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmailWithSecrets(dto.email);
    const passwordOk = user
      ? await verifyPassword(user.passwordHash, dto.password)
      : await verifyPassword(
          await hashPassword(dto.password),
          dto.password,
        ).then(() => false);
    if (!user || !user.active || !passwordOk) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const tokens = await this.issueTokens(user);
    await this.users.setRefreshTokenHash(
      user.id,
      hashSecret(tokens.refreshToken),
    );
    const organization = await this.organizations.findOneByOrFail({
      id: user.organizationId,
    });
    return {
      ...tokens,
      user: toUserResponse(user),
      organization: toOrganizationResponse(organization),
    };
  }

  async refresh(dto: RefreshDto) {
    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(
        dto.refreshToken,
        { secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }) },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findByIdWithSecrets(payload.sub);
    if (!user || !user.active || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (user.refreshTokenHash !== hashSecret(dto.refreshToken)) {
      await this.users.setRefreshTokenHash(user.id, null);
      throw new UnauthorizedException('Refresh token reuse detected');
    }
    const tokens = await this.issueTokens(user);
    await this.users.setRefreshTokenHash(
      user.id,
      hashSecret(tokens.refreshToken),
    );
    return tokens;
  }

  async logout(userId: string) {
    await this.users.setRefreshTokenHash(userId, null);
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    const organization = await this.organizations.findOneByOrFail({
      id: user.organizationId,
    });
    return {
      user: toUserResponse(user),
      organization: toOrganizationResponse(organization),
    };
  }

  private async issueTokens(user: User) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
      email: user.email,
    };
    const accessTtl = this.config.get('JWT_ACCESS_TTL', {
      infer: true,
    }) as SignOptions['expiresIn'];
    const refreshTtl = this.config.get('JWT_REFRESH_TTL', {
      infer: true,
    }) as SignOptions['expiresIn'];
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: accessTtl,
    });
    const refreshToken = await this.jwt.signAsync(
      { ...payload, nonce: newSecret() },
      {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
        expiresIn: refreshTtl,
      },
    );
    return { accessToken, refreshToken };
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    const taken = await this.organizations.exists({ where: { slug: base } });
    if (!taken) {
      return base;
    }
    return `${base}-${newSecret().slice(0, 6).toLowerCase()}`;
  }
}
