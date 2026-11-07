import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { NotificationChannel, NotificationStatus } from '../../../common/enums';

@Entity({ name: 'audit_logs' })
export class AuditLog extends TenantEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  actorUserId: string | null;

  @Column({ type: 'varchar', length: 80 })
  action: string;

  @Column({ type: 'varchar', length: 80 })
  entityType: string;

  @Column({ type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata: Record<string, unknown>;
}

@Entity({ name: 'webhook_endpoints' })
export class WebhookEndpoint extends TenantEntity {
  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  events: string[];

  @Column({ type: 'varchar' })
  secret: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}

@Entity({ name: 'notifications' })
export class NotificationMessage extends TenantEntity {
  @Column({ type: 'varchar', length: 32 })
  channel: NotificationChannel;

  @Column({ type: 'varchar', length: 320 })
  recipient: string;

  @Column({ type: 'varchar', length: 120 })
  template: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  payload: Record<string, unknown>;

  @Column({ type: 'varchar', length: 32, default: NotificationStatus.Pending })
  status: NotificationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date | null;
}

@Entity({ name: 'stored_documents' })
export class StoredDocument extends TenantEntity {
  @Column({ type: 'varchar', length: 80 })
  ownerType: string;

  @Column({ type: 'uuid' })
  ownerId: string;

  @Column({ type: 'varchar', length: 500 })
  storageKey: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 120 })
  contentType: string;
}
