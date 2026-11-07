import { Column, Entity, Index } from 'typeorm';
import { BaseEntity, TenantEntity } from '../../../common/base.entity';
import type { RoleName } from '../../../common/enums';

@Entity({ name: 'organizations' })
export class Organization extends BaseEntity {
  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  slug: string;
}

@Entity({ name: 'roles' })
@Index(['organizationId', 'name'], { unique: true })
export class Role extends TenantEntity {
  @Column({ type: 'varchar', length: 32 })
  name: RoleName;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  permissions: string[];
}

@Entity({ name: 'users' })
export class User extends TenantEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({ type: 'varchar', select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 80 })
  firstName: string;

  @Column({ type: 'varchar', length: 80 })
  lastName: string;

  @Column({ type: 'varchar', length: 32 })
  role: RoleName;

  @Column({ type: 'varchar', nullable: true, select: false })
  refreshTokenHash: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
