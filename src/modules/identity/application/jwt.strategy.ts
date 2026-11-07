import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AccessTokenPayload, AuthUser } from '../../../common/auth-user';
import type { AppEnv } from '../../../config/env.schema';
import { UsersService } from './users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService<AppEnv, true>,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET', { infer: true }),
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthUser> {
    const user = await this.users.findById(payload.sub);
    if (
      !user ||
      !user.active ||
      user.organizationId !== payload.organizationId
    ) {
      throw new UnauthorizedException();
    }
    return {
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      email: user.email,
    };
  }
}
