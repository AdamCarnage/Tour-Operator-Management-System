import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { CalendarItemKind } from '../../../common/enums';

@Entity({ name: 'calendar_items' })
export class CalendarItem extends TenantEntity {
  @Column({ type: 'varchar', length: 32 })
  kind: CalendarItemKind;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'timestamptz' })
  startsAt: Date;

  @Column({ type: 'timestamptz' })
  endsAt: Date;

  @Column({ type: 'boolean', default: false })
  allDay: boolean;

  @Column({ type: 'varchar', length: 80, default: 'general' })
  category: string;

  @Column({ type: 'varchar', length: 16, default: '#ef4444' })
  color: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  location: string;

  @Index()
  @Column({ type: 'uuid' })
  createdByUserId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  assignedToUserId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  bookingId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  departureId: string | null;
}
