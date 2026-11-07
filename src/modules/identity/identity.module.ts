import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { SignOptions } from 'jsonwebtoken';
import type { AppEnv } from '../../config/env.schema';
import { AuthController } from './api/auth.controller';
import {
  OrganizationController,
  RolesController,
  UsersController,
} from './api/users.controller';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './application/jwt.strategy';
import { UsersService } from './application/users.service';
import { Organization, Role, User } from './infrastructure/identity.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, User, Role]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) => ({
        secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_TTL', {
            infer: true,
          }) as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    OrganizationController,
  ],
  providers: [AuthService, UsersService, JwtStrategy],
  exports: [UsersService],
})
export class IdentityModule {}
