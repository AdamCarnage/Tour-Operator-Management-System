import type { RoleName } from './enums';

export type AuthUser = {
  userId: string;
  organizationId: string;
  role: RoleName;
  email: string;
};

export type AccessTokenPayload = {
  sub: string;
  organizationId: string;
  role: RoleName;
  email: string;
};
