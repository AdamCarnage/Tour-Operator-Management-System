import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { QuoteStatus } from '../../../common/enums';
import { moneyTransformer, rateTransformer } from '../../../common/money';

@Entity({ name: 'quotes' })
export class Quote extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  customerId: string;

  @Column({ type: 'uuid', nullable: true })
  leadId: string | null;

  @Column({ type: 'uuid', nullable: true })
  productId: string | null;

  @Column({ type: 'uuid', nullable: true })
  templateId: string | null;

  @Column({ type: 'varchar', length: 32, default: QuoteStatus.Draft })
  status: QuoteStatus;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar', length: 160 })
  title: string;
}

@Entity({ name: 'quote_versions' })
@Index(['quoteId', 'versionNumber'], { unique: true })
export class QuoteVersion extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  quoteId: string;

  @Column({ type: 'int' })
  versionNumber: number;

  @Column({ type: 'int' })
  paxCount: number;

  @Column({ type: 'int' })
  vehicleCount: number;

  @Column({
    type: 'numeric',
    precision: 18,
    scale: 8,
    transformer: rateTransformer,
  })
  fxRate: string;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  totalCostMinor: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  totalSellMinor: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  marginMinor: number;

  @Column({ type: 'text', default: '' })
  notes: string;
}

@Entity({ name: 'quote_lines' })
export class QuoteLine extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  versionId: string;

  @Column({ type: 'varchar', length: 160 })
  description: string;

  @Column({ type: 'varchar', length: 80 })
  category: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  unitCostMinor: number;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  unitSellMinor: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;
}
