import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import {
  ConversationChannel,
  MessageSenderType,
} from '../../../common/enums';
import { findOwned, pageWindow } from '../../../common/pagination';
import {
  ChatMessage,
  Conversation,
  ConversationParticipant,
} from '../infrastructure/messaging.entities';
import type {
  CreateConversationDto,
  IngestExternalMessageDto,
  SendMessageDto,
} from '../api/messaging.dto';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversations: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participants: Repository<ConversationParticipant>,
    @InjectRepository(ChatMessage)
    private readonly messages: Repository<ChatMessage>,
  ) {}

  async listConversations(
    user: AuthUser,
    page?: number,
    limit?: number,
    channel?: ConversationChannel,
  ) {
    const window = pageWindow(page, limit);
    const memberships = await this.participants.find({
      where: { organizationId: user.organizationId, userId: user.userId },
    });
    const ids = memberships.map((row) => row.conversationId);
    if (ids.length === 0) {
      return {
        data: [],
        meta: { page: window.page, limit: window.limit, total: 0 },
      };
    }
    const qb = this.conversations
      .createQueryBuilder('conversation')
      .where('conversation.organizationId = :organizationId', {
        organizationId: user.organizationId,
      })
      .andWhere('conversation.id IN (:...ids)', { ids });
    if (channel) {
      qb.andWhere('conversation.channel = :channel', { channel });
    }
    const [data, total] = await qb
      .orderBy('conversation.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('conversation.createdAt', 'DESC')
      .skip(window.skip)
      .take(window.limit)
      .getManyAndCount();
    return {
      data,
      meta: { page: window.page, limit: window.limit, total },
    };
  }

  async getConversation(user: AuthUser, id: string) {
    await this.assertMember(user, id);
    const conversation = await findOwned(
      this.conversations,
      user.organizationId,
      id,
      'Conversation',
    );
    const participants = await this.participants.find({
      where: { organizationId: user.organizationId, conversationId: id },
    });
    return { ...conversation, participants };
  }

  async createConversation(user: AuthUser, dto: CreateConversationDto) {
    if (!dto.participants.length) {
      throw new BadRequestException('At least one participant is required');
    }
    for (const participant of dto.participants) {
      if (!participant.userId && !participant.externalParticipantKey) {
        throw new BadRequestException(
          'Each participant needs a userId or externalParticipantKey',
        );
      }
    }
    if (
      dto.channel === ConversationChannel.ExternalPlatform &&
      !dto.externalPlatform
    ) {
      throw new BadRequestException(
        'externalPlatform is required for outside-platform conversations',
      );
    }
    const conversation = await this.conversations.save(
      this.conversations.create({
        organizationId: user.organizationId,
        channel: dto.channel,
        subject: dto.subject ?? '',
        externalThreadId: dto.externalThreadId ?? null,
        externalPlatform: dto.externalPlatform ?? null,
        lastMessageAt: null,
        metadata: {},
      }),
    );
    const rows = [
      {
        organizationId: user.organizationId,
        conversationId: conversation.id,
        userId: user.userId,
        externalParticipantKey: null,
        displayName: 'Me',
        lastReadAt: new Date(),
      },
      ...dto.participants
        .filter((participant) => participant.userId !== user.userId)
        .map((participant) => ({
          organizationId: user.organizationId,
          conversationId: conversation.id,
          userId: participant.userId ?? null,
          externalParticipantKey: participant.externalParticipantKey ?? null,
          displayName: participant.displayName,
          lastReadAt: null,
        })),
    ];
    await this.participants.save(this.participants.create(rows));
    return this.getConversation(user, conversation.id);
  }

  async listMessages(
    user: AuthUser,
    conversationId: string,
    page?: number,
    limit?: number,
  ) {
    await this.assertMember(user, conversationId);
    const window = pageWindow(page, limit);
    const [data, total] = await this.messages.findAndCount({
      where: { organizationId: user.organizationId, conversationId },
      order: { createdAt: 'ASC' },
      skip: window.skip,
      take: window.limit,
    });
    return {
      data,
      meta: { page: window.page, limit: window.limit, total },
    };
  }

  async sendMessage(
    user: AuthUser,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    await this.assertMember(user, conversationId);
    const conversation = await findOwned(
      this.conversations,
      user.organizationId,
      conversationId,
      'Conversation',
    );
    const message = await this.messages.save(
      this.messages.create({
        organizationId: user.organizationId,
        conversationId,
        senderType: MessageSenderType.User,
        senderUserId: user.userId,
        senderDisplayName: null,
        body: dto.body,
        attachments: dto.attachments ?? [],
      }),
    );
    conversation.lastMessageAt = message.createdAt;
    await this.conversations.save(conversation);
    await this.participants.update(
      {
        organizationId: user.organizationId,
        conversationId,
        userId: user.userId,
      },
      { lastReadAt: new Date() },
    );
    return message;
  }

  async markRead(user: AuthUser, conversationId: string) {
    await this.assertMember(user, conversationId);
    await this.participants.update(
      {
        organizationId: user.organizationId,
        conversationId,
        userId: user.userId,
      },
      { lastReadAt: new Date() },
    );
    return { ok: true };
  }

  async ingestExternal(user: AuthUser, dto: IngestExternalMessageDto) {
    let conversation = await this.conversations.findOne({
      where: {
        organizationId: user.organizationId,
        channel: ConversationChannel.ExternalPlatform,
        externalThreadId: dto.externalThreadId,
      },
    });
    if (!conversation) {
      conversation = await this.conversations.save(
        this.conversations.create({
          organizationId: user.organizationId,
          channel: ConversationChannel.ExternalPlatform,
          subject: dto.subject ?? '',
          externalThreadId: dto.externalThreadId,
          externalPlatform: dto.externalPlatform,
          lastMessageAt: null,
          metadata: {},
        }),
      );
      await this.participants.save(
        this.participants.create([
          {
            organizationId: user.organizationId,
            conversationId: conversation.id,
            userId: user.userId,
            externalParticipantKey: null,
            displayName: 'Desk',
            lastReadAt: null,
          },
          {
            organizationId: user.organizationId,
            conversationId: conversation.id,
            userId: null,
            externalParticipantKey: dto.senderKey,
            displayName: dto.senderDisplayName,
            lastReadAt: null,
          },
        ]),
      );
    } else {
      const existing = await this.participants.findOne({
        where: {
          organizationId: user.organizationId,
          conversationId: conversation.id,
          externalParticipantKey: dto.senderKey,
        },
      });
      if (!existing) {
        await this.participants.save(
          this.participants.create({
            organizationId: user.organizationId,
            conversationId: conversation.id,
            userId: null,
            externalParticipantKey: dto.senderKey,
            displayName: dto.senderDisplayName,
            lastReadAt: null,
          }),
        );
      }
      const desk = await this.participants.findOne({
        where: {
          organizationId: user.organizationId,
          conversationId: conversation.id,
          userId: user.userId,
        },
      });
      if (!desk) {
        await this.participants.save(
          this.participants.create({
            organizationId: user.organizationId,
            conversationId: conversation.id,
            userId: user.userId,
            externalParticipantKey: null,
            displayName: 'Desk',
            lastReadAt: null,
          }),
        );
      }
    }
    const message = await this.messages.save(
      this.messages.create({
        organizationId: user.organizationId,
        conversationId: conversation.id,
        senderType: MessageSenderType.External,
        senderUserId: null,
        senderDisplayName: dto.senderDisplayName,
        body: dto.body,
        attachments: dto.attachments ?? [],
      }),
    );
    conversation.lastMessageAt = message.createdAt;
    if (dto.subject && !conversation.subject) {
      conversation.subject = dto.subject;
    }
    await this.conversations.save(conversation);
    return { conversation, message };
  }

  async unreadCount(user: AuthUser) {
    const memberships = await this.participants.find({
      where: { organizationId: user.organizationId, userId: user.userId },
    });
    if (memberships.length === 0) {
      return { unreadConversations: 0 };
    }
    let unreadConversations = 0;
    for (const membership of memberships) {
      const qb = this.messages
        .createQueryBuilder('message')
        .where('message.organizationId = :organizationId', {
          organizationId: user.organizationId,
        })
        .andWhere('message.conversationId = :conversationId', {
          conversationId: membership.conversationId,
        })
        .andWhere(
          '(message.senderUserId IS NULL OR message.senderUserId != :userId)',
          { userId: user.userId },
        );
      if (membership.lastReadAt) {
        qb.andWhere('message.createdAt > :lastReadAt', {
          lastReadAt: membership.lastReadAt,
        });
      }
      const count = await qb.getCount();
      if (count > 0) {
        unreadConversations += 1;
      }
    }
    return { unreadConversations };
  }

  private async assertMember(user: AuthUser, conversationId: string) {
    const member = await this.participants.findOne({
      where: {
        organizationId: user.organizationId,
        conversationId,
        userId: user.userId,
      },
    });
    if (!member) {
      const exists = await this.conversations.findOne({
        where: { id: conversationId, organizationId: user.organizationId },
      });
      if (!exists) {
        throw new NotFoundException('Conversation not found');
      }
      throw new ForbiddenException('You are not a participant');
    }
  }
}
