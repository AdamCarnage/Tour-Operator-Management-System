import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { NotificationStatus } from '../../../common/enums';
import { NotificationMessage } from '../infrastructure/admin.entities';
import {
  NOTIFICATION_QUEUE,
  type NotificationDispatcher,
  type NotificationJob,
} from './notification.types';

@Injectable()
export class BullNotificationDispatcher implements NotificationDispatcher {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly queue: Queue<NotificationJob>,
    @InjectRepository(NotificationMessage)
    private readonly messages: Repository<NotificationMessage>,
  ) {}

  async dispatch(message: NotificationMessage): Promise<void> {
    await this.queue.add(
      'deliver',
      { notificationId: message.id },
      { jobId: message.id, removeOnComplete: 100 },
    );
    await this.messages.update(message.id, {
      status: NotificationStatus.Queued,
    });
  }
}
