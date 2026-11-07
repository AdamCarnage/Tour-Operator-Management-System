import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { CostBasis, ProductKind } from '../../../common/enums';
import { moneyTransformer } from '../../../common/money';

@Entity({ name: 'products' })
export class Product extends TenantEntity {
  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 32 })
  kind: ProductKind;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'int', default: 1 })
  durationDays: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}

@Entity({ name: 'itinerary_templates' })
export class ItineraryTemplate extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;
}

@Entity({ name: 'itinerary_days' })
@Index(['templateId', 'dayNumber'], { unique: true })
export class ItineraryDay extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  templateId: string;

  @Column({ type: 'int' })
  dayNumber: number;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'varchar', length: 160, default: '' })
  location: string;
}

@Entity({ name: 'service_lines' })
export class ServiceLine extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  dayId: string;

  @Column({ type: 'uuid', nullable: true })
  supplierId: string | null;

  @Column({ type: 'varchar', length: 160 })
  description: string;

  @Column({ type: 'varchar', length: 80 })
  category: string;

  @Column({ type: 'varchar', length: 32 })
  basis: CostBasis;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  unitCostMinor: number;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  unitSellMinor: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;
}
