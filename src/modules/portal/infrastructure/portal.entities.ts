import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';

@Entity({ name: 'portal_tokens' })
export class PortalToken extends TenantEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  tokenHash: string;

  @Column({ type: 'uuid', nullable: true })
  quoteId: string | null;

  @Column({ type: 'uuid', nullable: true })
  bookingId: string | null;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;
}

@Entity({ name: 'client_feedback' })
export class ClientFeedback extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  bookingId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', default: '' })
  comment: string;
}
