import type { Organization, User } from '../infrastructure/identity.entities';

export function toOrganizationResponse(organization: Organization) {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
  };
}

export function toUserResponse(
  user: User,
  organization?: Pick<Organization, 'id' | 'name' | 'slug'> | null,
) {
  return {
    id: user.id,
    organizationId: user.organizationId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...(organization
      ? {
          organization: {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
          },
        }
      : {}),
  };
}
