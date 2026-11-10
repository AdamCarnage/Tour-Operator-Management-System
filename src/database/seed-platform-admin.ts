import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { RoleName } from '../common/enums';
import { parseEnv } from '../config/env.schema';
import { ROLE_PERMISSIONS } from '../modules/identity/domain/permissions';
import { slugify } from '../modules/identity/domain/slug';
import {
  Organization,
  Role,
  User,
} from '../modules/identity/infrastructure/identity.entities';
import { hashPassword } from '../modules/identity/infrastructure/password.hasher';
import { postgresConnection } from './typeorm-options';

loadEnv();

const PLATFORM_ORG_NAME = 'Ixplore Global';
const PLATFORM_ORG_SLUG = slugify(PLATFORM_ORG_NAME);
const PLATFORM_ADMIN = {
  email: 'ixploreglobal@gmail.com',
  password: 'Ixplore@123',
  firstName: 'Platform',
  lastName: 'Admin',
  role: RoleName.PlatformAdmin,
} as const;

async function seedPlatformAdmin() {
  const env = parseEnv(process.env);
  const dataSource = new DataSource({
    ...postgresConnection(env),
    entities: [Organization, Role, User],
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    const organizations = dataSource.getRepository(Organization);
    const roles = dataSource.getRepository(Role);
    const users = dataSource.getRepository(User);
    const email = PLATFORM_ADMIN.email.toLowerCase();
    const passwordHash = await hashPassword(PLATFORM_ADMIN.password);

    let organization = await organizations.findOne({
      where: { slug: PLATFORM_ORG_SLUG },
    });
    if (!organization) {
      organization = await organizations.save(
        organizations.create({
          name: PLATFORM_ORG_NAME,
          slug: PLATFORM_ORG_SLUG,
        }),
      );
      console.log(`Created organization ${organization.name} (${organization.id})`);
    } else {
      console.log(`Using organization ${organization.name} (${organization.id})`);
    }

    const existingRoles = await roles.find({
      where: { organizationId: organization.id },
    });
    const missingRoles = Object.values(RoleName).filter(
      (name) => !existingRoles.some((role) => role.name === name),
    );
    if (missingRoles.length > 0) {
      await roles.save(
        missingRoles.map((name) =>
          roles.create({
            organizationId: organization.id,
            name,
            permissions: [...ROLE_PERMISSIONS[name]],
          }),
        ),
      );
      console.log(`Seeded ${missingRoles.length} role(s)`);
    }

    const existing = await users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    if (existing) {
      existing.organizationId = organization.id;
      existing.passwordHash = passwordHash;
      existing.firstName = PLATFORM_ADMIN.firstName;
      existing.lastName = PLATFORM_ADMIN.lastName;
      existing.role = PLATFORM_ADMIN.role;
      existing.active = true;
      await users.save(existing);
      console.log(`Updated platform admin ${email} (${existing.id})`);
    } else {
      const user = await users.save(
        users.create({
          organizationId: organization.id,
          email,
          passwordHash,
          firstName: PLATFORM_ADMIN.firstName,
          lastName: PLATFORM_ADMIN.lastName,
          role: PLATFORM_ADMIN.role,
          active: true,
          refreshTokenHash: null,
        }),
      );
      console.log(`Created platform admin ${email} (${user.id})`);
    }

    console.log('Platform admin seed complete.');
  } finally {
    await dataSource.destroy();
  }
}

seedPlatformAdmin().catch((error: unknown) => {
  console.error('Platform admin seed failed', error);
  process.exitCode = 1;
});
