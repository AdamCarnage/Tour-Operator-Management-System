import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import {
  CostBasis,
  PayableStatus,
  SupplierRequestStatus,
} from '../../../common/enums';
import { moneyTransformer } from '../../../common/money';

@Entity({ name: 'suppliers' })
export class Supplier extends TenantEntity {
  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 80, default: '' })
  country: string;

  @Column({ type: 'text', default: '' })
  notes: string;
}

@Entity({ name: 'properties' })
export class Property extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  supplierId: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 160, default: '' })
  location: string;

  @Column({ type: 'varchar', length: 80, default: 'lodge' })
  kind: string;
}

@Entity({ name: 'room_types' })
export class RoomType extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  propertyId: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'int', default: 2 })
  capacity: number;
}

@Entity({ name: 'seasonal_rates' })
export class SeasonalRate extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  supplierId: string;

  @Column({ type: 'uuid', nullable: true })
  roomTypeId: string | null;

  @Column({ type: 'varchar', length: 80 })
  seasonName: string;

  @Column({ type: 'date' })
  startsOn: string;

  @Column({ type: 'date' })
  endsOn: string;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amountMinor: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar', length: 32 })
  basis: CostBasis;
}

@Entity({ name: 'supplier_requests' })
export class SupplierRequest extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  supplierId: string;

  @Index()
  @Column({ type: 'uuid' })
  bookingId: string;

  @Column({
    type: 'varchar',
    length: 32,
    default: SupplierRequestStatus.Requested,
  })
  status: SupplierRequestStatus;

  @Column({ type: 'text', default: '' })
  details: string;
}

@Entity({ name: 'payables' })
export class Payable extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  supplierId: string;

  @Column({ type: 'uuid', nullable: true })
  bookingId: string | null;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amountMinor: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar', length: 32, default: PayableStatus.Open })
  status: PayableStatus;

  @Column({ type: 'date' })
  dueOn: string;
}
