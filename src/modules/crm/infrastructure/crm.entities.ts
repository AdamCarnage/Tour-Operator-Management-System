import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { LeadStatus } from '../../../common/enums';

@Entity({ name: 'customers' })
export class Customer extends TenantEntity {
  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 32, default: 'traveler' })
  kind: string;

  @Column({ type: 'text', default: '' })
  notes: string;
}

@Entity({ name: 'leads' })
export class Lead extends TenantEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 80, default: 'manual' })
  source: string;

  @Column({ type: 'varchar', length: 32, default: LeadStatus.New })
  status: LeadStatus;

  @Column({ type: 'text', default: '' })
  notes: string;
}

@Entity({ name: 'communications' })
export class Communication extends TenantEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  leadId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ type: 'varchar', length: 32 })
  channel: string;

  @Column({ type: 'varchar', length: 16 })
  direction: string;

  @Column({ type: 'text' })
  body: string;
}
