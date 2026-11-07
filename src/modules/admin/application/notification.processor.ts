import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { NotificationChannel, NotificationStatus } from '../../../common/enums';
import {
  NotificationMessage,
  WebhookEndpoint,
} from '../infrastructure/admin.entities';
import { deliverWebhook } from './admin.services';
import { NOTIFICATION_QUEUE } from './notification.types';
import { NotificationsService } from './admin.services';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notifications: NotificationsService,
    @InjectRepository(NotificationMessage)
    private readonly messages: Repository<NotificationMessage>,
    @InjectRepository(WebhookEndpoint)
    private readonly endpoints: Repository<WebhookEndpoint>,
  ) {
    super();
  }

  async process(job: Job<{ notificationId: string }>): Promise<void> {
    const row = await this.messages.findOne({
      where: { id: job.data.notificationId },
    });
    if (!row) {
      return;
    }
    if (row.channel !== NotificationChannel.Webhook) {
      await this.notifications.mark(row.id, NotificationStatus.Processed);
      return;
    }
    const hook = await this.endpoints.findOne({
      where: {
        organizationId: row.organizationId,
        url: row.recipient,
        active: true,
      },
    });
    const ok = hook
      ? await deliverWebhook(
          hook.url,
          hook.secret,
          JSON.stringify({ event: row.template, payload: row.payload }),
          this.logger,
        )
      : false;
    await this.notifications.mark(
      row.id,
      ok ? NotificationStatus.Processed : NotificationStatus.Failed,
    );
  }
}
