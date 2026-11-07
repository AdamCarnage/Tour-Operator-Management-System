import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { AvailabilityStatus, StaffKind } from '../../../common/enums';

@Entity({ name: 'staff_members' })
export class StaffMember extends TenantEntity {
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 32 })
  kind: StaffKind;

  @Column({ type: 'varchar', length: 80 })
  firstName: string;

  @Column({ type: 'varchar', length: 80 })
  lastName: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  languages: string[];

  @Column({ type: 'boolean', default: true })
  active: boolean;
}

@Entity({ name: 'certifications' })
export class Certification extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  staffId: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'date', nullable: true })
  issuedOn: string | null;

  @Column({ type: 'date', nullable: true })
  expiresOn: string | null;
}

@Entity({ name: 'staff_availability' })
export class StaffAvailability extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  staffId: string;

  @Column({ type: 'date' })
  startsOn: string;

  @Column({ type: 'date' })
  endsOn: string;

  @Column({
    type: 'varchar',
    length: 32,
    default: AvailabilityStatus.Available,
  })
  status: AvailabilityStatus;
}

@Entity({ name: 'vehicles' })
export class Vehicle extends TenantEntity {
  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 32 })
  plate: string;

  @Column({ type: 'varchar', length: 80 })
  kind: string;

  @Column({ type: 'int' })
  seats: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}

@Entity({ name: 'gear_items' })
export class GearItem extends TenantEntity {
  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'text', default: '' })
  notes: string;
}
