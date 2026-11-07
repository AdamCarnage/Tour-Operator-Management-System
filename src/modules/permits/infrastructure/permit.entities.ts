import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { ControlNumberStatus, PermitStatus } from '../../../common/enums';
import { moneyTransformer } from '../../../common/money';

@Entity({ name: 'park_permits' })
export class ParkPermit extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  departureId: string;

  @Column({ type: 'varchar', length: 160 })
  parkName: string;

  @Column({ type: 'varchar', length: 32, default: PermitStatus.Draft })
  status: PermitStatus;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  totalMinor: number;
}

@Entity({ name: 'park_fee_lines' })
export class ParkFeeLine extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  permitId: string;

  @Column({ type: 'varchar', length: 160 })
  description: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  unitAmountMinor: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;
}

@Entity({ name: 'control_numbers' })
export class ControlNumber extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  permitId: string;

  @Column({ type: 'varchar', length: 80 })
  number: string;

  @Column({ type: 'varchar', length: 32, default: ControlNumberStatus.Pending })
  status: ControlNumberStatus;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amountMinor: number;
}
