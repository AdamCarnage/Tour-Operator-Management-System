import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import { EmailCategory, EmailFolder } from '../../../common/enums';

@Entity({ name: 'mailboxes' })
@Index(['organizationId', 'address'], { unique: true })
export class Mailbox extends TenantEntity {
  @Column({ type: 'varchar', length: 320 })
  address: string;

  /** gmail | outlook | ses | mailgun | custom, etc. */
  @Column({ type: 'varchar', length: 40 })
  provider: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  label: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}

@Entity({ name: 'email_messages' })
export class EmailMessage extends TenantEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  mailboxId: string | null;

  @Column({ type: 'varchar', length: 32, default: EmailFolder.Inbox })
  folder: EmailFolder;

  @Column({ type: 'varchar', length: 32, default: EmailCategory.General })
  category: EmailCategory;

  @Column({ type: 'varchar', length: 320 })
  fromAddress: string;

  @Column({ type: 'varchar', length: 160, default: '' })
  fromName: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  toAddresses: string[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  ccAddresses: string[];

  @Column({ type: 'varchar', length: 300, default: '' })
  subject: string;

  @Column({ type: 'text', default: '' })
  bodyText: string;

  @Column({ type: 'text', nullable: true })
  bodyHtml: string | null;

  @Column({ type: 'varchar', length: 40 })
  provider: string;

  @Index()
  @Column({ type: 'varchar', length: 200, nullable: true })
  externalMessageId: string | null;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
  isStarred: boolean;

  @Column({ type: 'timestamptz' })
  receivedAt: Date;
}
