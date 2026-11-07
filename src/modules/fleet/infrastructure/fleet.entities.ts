import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { MaintenanceStatus } from '../../../common/enums';
import { moneyTransformer } from '../../../common/money';

@Entity({ name: 'maintenance_tasks' })
export class MaintenanceTask extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  vehicleId: string;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'date' })
  dueOn: string;

  @Column({ type: 'varchar', length: 32, default: MaintenanceStatus.Scheduled })
  status: MaintenanceStatus;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  costMinor: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;
}

@Entity({ name: 'fuel_logs' })
export class FuelLog extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  vehicleId: string;

  @Column({ type: 'uuid', nullable: true })
  departureId: string | null;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  liters: string;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amountMinor: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'int', nullable: true })
  odometer: number | null;

  @Column({ type: 'date' })
  filledOn: string;
}
