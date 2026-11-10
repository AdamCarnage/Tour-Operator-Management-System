import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY, ROLES_KEY } from './decorators';
import type { AuthUser } from './auth-user';
import { RoleName } from './enums';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}

@Injectable()
export class RolesGuard {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const required = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    if (!user) {
      return false;
    }
    // Platform-only endpoints are never opened by org owner/admin bypass.
    if (
      required?.length === 1 &&
      required[0] === RoleName.PlatformAdmin
    ) {
      if (user.role !== RoleName.PlatformAdmin) {
        throw new ForbiddenException('Platform admin access required');
      }
      return true;
    }
    if (
      user.role === RoleName.PlatformAdmin ||
      user.role === RoleName.Owner ||
      user.role === RoleName.Admin
    ) {
      return true;
    }
    if (!required || required.length === 0) {
      return true;
    }
    if (!required.includes(user.role)) {
      throw new ForbiddenException('You do not have access to this resource');
    }
    return true;
  }
}
