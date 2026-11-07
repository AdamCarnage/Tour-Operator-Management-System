import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { InspectionResult } from '../../../common/enums';
import { moneyTransformer } from '../../../common/money';

@Entity({ name: 'field_check_ins' })
@Index(['organizationId', 'idempotencyKey'], { unique: true })
export class FieldCheckIn extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  departureId: string;

  @Index()
  @Column({ type: 'uuid' })
  travelerId: string;

  @Column({ type: 'timestamptz' })
  checkedInAt: Date;

  @Column({ type: 'varchar', length: 80 })
  idempotencyKey: string;
}

@Entity({ name: 'field_expenses' })
@Index(['organizationId', 'idempotencyKey'], { unique: true })
export class FieldExpense extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  departureId: string;

  @Column({ type: 'uuid', nullable: true })
  staffId: string | null;

  @Column({ type: 'varchar', length: 80 })
  category: string;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amountMinor: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'text', default: '' })
  note: string;

  @Column({ type: 'varchar', length: 80 })
  idempotencyKey: string;
}

@Entity({ name: 'field_inspections' })
@Index(['organizationId', 'idempotencyKey'], { unique: true })
export class FieldInspection extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  vehicleId: string;

  @Column({ type: 'uuid', nullable: true })
  departureId: string | null;

  @Column({ type: 'varchar', length: 16 })
  result: InspectionResult;

  @Column({ type: 'text', default: '' })
  notes: string;

  @Column({ type: 'varchar', length: 80 })
  idempotencyKey: string;
}
