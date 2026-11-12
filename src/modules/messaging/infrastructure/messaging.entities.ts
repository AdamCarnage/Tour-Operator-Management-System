import { Column, Entity, Index } from 'typeorm';
import { TenantEntity } from '../../../common/base.entity';
import {
  ConversationChannel,
  MessageSenderType,
} from '../../../common/enums';

@Entity({ name: 'conversations' })
export class Conversation extends TenantEntity {
  @Column({ type: 'varchar', length: 32 })
  channel: ConversationChannel;

  @Column({ type: 'varchar', length: 200, default: '' })
  subject: string;

  /** External platform thread id when channel is external_platform. */
  @Index()
  @Column({ type: 'varchar', length: 160, nullable: true })
  externalThreadId: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  externalPlatform: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata: Record<string, unknown>;
}

@Entity({ name: 'conversation_participants' })
@Index(['conversationId', 'userId'], { unique: true })
@Index(['conversationId', 'externalParticipantKey'], { unique: true })
export class ConversationParticipant extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  conversationId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  /** Stable key for outside-platform participants (email, platform user id, etc.). */
  @Column({ type: 'varchar', length: 160, nullable: true })
  externalParticipantKey: string | null;

  @Column({ type: 'varchar', length: 160 })
  displayName: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastReadAt: Date | null;
}

@Entity({ name: 'chat_messages' })
export class ChatMessage extends TenantEntity {
  @Index()
  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({ type: 'varchar', length: 32 })
  senderType: MessageSenderType;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  senderUserId: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  senderDisplayName: string | null;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  attachments: Array<{ name: string; url: string; contentType?: string }>;
}
