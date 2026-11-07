import { config as loadEnv } from 'dotenv';
import { DynamicModule, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from '../../platform/storage.service';
import { AdminController, DocumentsController } from './api/admin.controller';
import { AuditService } from './application/audit.service';
import { BullNotificationDispatcher } from './application/bull-notification.dispatcher';
import {
  LocalNotificationDispatcher,
  NotificationsService,
  WebhooksService,
} from './application/admin.services';
import { NotificationProcessor } from './application/notification.processor';
import {
  NOTIFICATION_DISPATCHER,
  NOTIFICATION_QUEUE,
} from './application/notification.types';
import {
  AuditLog,
  NotificationMessage,
  StoredDocument,
  WebhookEndpoint,
} from './infrastructure/admin.entities';

loadEnv();

const entities = [
  AuditLog,
  WebhookEndpoint,
  NotificationMessage,
  StoredDocument,
];

@Module({})
export class AdminModule {
  static register(): DynamicModule {
    const redisUrl = process.env.REDIS_URL?.trim();
    const sharedProviders = [
      AuditService,
      NotificationsService,
      WebhooksService,
      StorageService,
    ];
    if (!redisUrl) {
      return {
        module: AdminModule,
        global: true,
        imports: [TypeOrmModule.forFeature(entities)],
        controllers: [AdminController, DocumentsController],
        providers: [
          ...sharedProviders,
          {
            provide: NOTIFICATION_DISPATCHER,
            useClass: LocalNotificationDispatcher,
          },
        ],
        exports: [
          AuditService,
          NotificationsService,
          WebhooksService,
          StorageService,
        ],
      };
    }
    return {
      module: AdminModule,
      global: true,
      imports: [
        TypeOrmModule.forFeature(entities),
        BullModule.forRoot({ connection: { url: redisUrl } }),
        BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
      ],
      controllers: [AdminController, DocumentsController],
      providers: [
        ...sharedProviders,
        BullNotificationDispatcher,
        NotificationProcessor,
        {
          provide: NOTIFICATION_DISPATCHER,
          useClass: BullNotificationDispatcher,
        },
      ],
      exports: [
        AuditService,
        NotificationsService,
        WebhooksService,
        StorageService,
      ],
    };
  }
}
