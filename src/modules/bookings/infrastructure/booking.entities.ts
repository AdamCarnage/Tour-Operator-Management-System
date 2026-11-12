import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import {
  BookingSource,
  BookingStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../../common/enums';
import { moneyTransformer, rateTransformer } from '../../../common/money';

@Entity({ name: 'bookings' })
export class Booking extends TenantEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  quoteId: string | null;

  @Index()
  @Column({ type: 'uuid' })
  customerId: string;

  @Column({ type: 'varchar', length: 32, default: BookingStatus.Pending })
  status: BookingStatus;

  @Column({ type: 'varchar', length: 32, default: BookingSource.Office })
  source: BookingSource;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  recordedByUserId: string | null;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({
    type: 'numeric',
    precision: 18,
    scale: 8,
    transformer: rateTransformer,
  })
  fxRate: string;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  totalCostMinor: number;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  totalSellMinor: number;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  depositDueMinor: number;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  balanceDueMinor: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;
}

@Entity({ name: 'travelers' })
export class Traveler extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  bookingId: string;

  @Column({ type: 'varchar', length: 160 })
  fullName: string;

  @Column({ type: 'varchar', length: 80 })
  nationality: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  gender: string | null;

  @Column({ type: 'text' })
  passportNumberEncrypted: string;

  @Column({ type: 'date', nullable: true })
  passportExpiry: string | null;
}

@Entity({ name: 'payments' })
export class Payment extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  bookingId: string;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amountMinor: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar', length: 32 })
  method: PaymentMethod;

  @Column({ type: 'varchar', length: 32, default: PaymentStatus.Received })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 120, default: '' })
  reference: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  recordedByUserId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;
}

@Entity({ name: 'invoices' })
@Index(['organizationId', 'number'], { unique: true })
export class Invoice extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  bookingId: string;

  @Column({ type: 'varchar', length: 40 })
  number: string;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amountMinor: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar', length: 32, default: InvoiceStatus.Issued })
  status: InvoiceStatus;

  @Column({ type: 'date' })
  issuedOn: string;

  @Column({ type: 'date' })
  dueOn: string;
}
