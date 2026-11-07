import { createHmac } from 'crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { NotificationChannel, NotificationStatus } from '../../../common/enums';
import { paginate } from '../../../common/pagination';
import {
  NotificationMessage,
  WebhookEndpoint,
} from '../infrastructure/admin.entities';
import {
  NOTIFICATION_DISPATCHER,
  type NotificationDispatcher,
} from './notification.types';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationMessage)
    private readonly messages: Repository<NotificationMessage>,
    @Inject(NOTIFICATION_DISPATCHER)
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  list(organizationId: string, page?: number, limit?: number) {
    return paginate(this.messages, organizationId, page, limit);
  }

  async notify(input: {
    organizationId: string;
    channel: NotificationChannel;
    recipient: string;
    template: string;
    payload: Record<string, unknown>;
  }) {
    const message = await this.messages.save(
      this.messages.create({
        ...input,
        status: NotificationStatus.Pending,
        processedAt: null,
      }),
    );
    await this.dispatcher.dispatch(message);
    return message;
  }

  async mark(id: string, status: NotificationStatus) {
    await this.messages.update(id, {
      status,
      processedAt: new Date(),
    });
  }
}

@Injectable()
export class LocalNotificationDispatcher implements NotificationDispatcher {
  constructor(
    @InjectRepository(NotificationMessage)
    private readonly messages: Repository<NotificationMessage>,
  ) {}

  async dispatch(message: NotificationMessage): Promise<void> {
    await this.messages.update(message.id, {
      status: NotificationStatus.Stored,
    });
    message.status = NotificationStatus.Stored;
  }
}

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly endpoints: Repository<WebhookEndpoint>,
    private readonly notifications: NotificationsService,
  ) {}

  list(organizationId: string) {
    return this.endpoints.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  create(
    organizationId: string,
    input: { url: string; events: string[]; secret: string },
  ) {
    return this.endpoints.save(
      this.endpoints.create({
        organizationId,
        url: input.url,
        events: input.events,
        secret: input.secret,
        active: true,
      }),
    );
  }

  async publish(
    organizationId: string,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const hooks = await this.endpoints.find({
      where: { organizationId, active: true },
    });
    const matching = hooks.filter((hook) => hook.events.includes(event));
    await Promise.all(
      matching.map((hook) =>
        this.notifications.notify({
          organizationId,
          channel: NotificationChannel.Webhook,
          recipient: hook.url,
          template: event,
          payload: { ...payload, secretHint: hook.id },
        }),
      ),
    );
  }
}

export async function deliverWebhook(
  url: string,
  secret: string,
  body: string,
  logger: Logger,
): Promise<boolean> {
  const signature = createHmac('sha256', secret).update(body).digest('hex');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-signature': signature,
      },
      body,
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'delivery failed';
    logger.warn(`Webhook delivery failed: ${message}`);
    return false;
  }
}

export type QueueJob = Job<{ notificationId: string }>;
