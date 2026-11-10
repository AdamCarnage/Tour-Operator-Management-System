import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import type { AuthUser } from '../../../common/auth-user';
import { CurrentUser, Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/enums';
import { findOwned, paginate } from '../../../common/pagination';
import { StorageService } from '../../../platform/storage.service';
import { AuditService } from '../application/audit.service';
import {
  NotificationsService,
  WebhooksService,
} from '../application/admin.services';
import { StoredDocument } from '../infrastructure/admin.entities';
import {
  AuditQueryDto,
  CreateWebhookDto,
  DocumentQueryDto,
  UploadDocumentDto,
} from './admin.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(RoleName.PlatformAdmin)
@Controller()
export class AdminController {
  constructor(
    private readonly audit: AuditService,
    private readonly webhooks: WebhooksService,
    private readonly notifications: NotificationsService,
  ) {}

  @Get('audit-logs')
  logs(@CurrentUser() user: AuthUser, @Query() query: AuditQueryDto) {
    return this.audit.list(user.organizationId, query.page, query.limit);
  }

  @Get('webhooks')
  async webhooksList(@CurrentUser() user: AuthUser) {
    const rows = await this.webhooks.list(user.organizationId);
    return rows.map((hook) => ({
      id: hook.id,
      organizationId: hook.organizationId,
      url: hook.url,
      events: hook.events,
      active: hook.active,
      createdAt: hook.createdAt,
      updatedAt: hook.updatedAt,
    }));
  }

  @Post('webhooks')
  createWebhook(@CurrentUser() user: AuthUser, @Body() dto: CreateWebhookDto) {
    return this.webhooks.create(user.organizationId, dto);
  }

  @Get('notifications')
  notificationsList(
    @CurrentUser() user: AuthUser,
    @Query() query: AuditQueryDto,
  ) {
    return this.notifications.list(
      user.organizationId,
      query.page,
      query.limit,
    );
  }
}

@ApiTags('Documents')
@ApiBearerAuth()
@Roles(RoleName.Sales, RoleName.Operations, RoleName.Accountant)
@Controller('documents')
export class DocumentsController {
  constructor(
    @InjectRepository(StoredDocument)
    private readonly documents: Repository<StoredDocument>,
    private readonly storage: StorageService,
  ) {}

  @Post()
  async upload(@CurrentUser() user: AuthUser, @Body() dto: UploadDocumentDto) {
    const body = Buffer.from(dto.contentBase64, 'base64');
    if (body.length === 0 || body.length > 5_000_000) {
      throw new BadRequestException('File must be between 1 byte and 5MB');
    }
    const filename = dto.filename.replace(/["\r\n]/g, '');
    const storageKey = `${user.organizationId}/${randomUUID()}-${filename}`;
    await this.storage.put(storageKey, body, dto.contentType);
    return this.documents.save(
      this.documents.create({
        organizationId: user.organizationId,
        ownerType: dto.ownerType,
        ownerId: dto.ownerId,
        storageKey,
        filename,
        contentType: dto.contentType,
      }),
    );
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: DocumentQueryDto) {
    return paginate(
      this.documents,
      user.organizationId,
      query.page,
      query.limit,
      {
        ...(query.ownerId ? { ownerId: query.ownerId } : {}),
      },
    );
  }

  @Get(':id')
  @Header('Cache-Control', 'private, no-store')
  async download(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const document = await findOwned(
      this.documents,
      user.organizationId,
      id,
      'Document',
    );
    const bytes = await this.storage.get(document.storageKey);
    return new StreamableFile(bytes, {
      type: document.contentType,
      disposition: `attachment; filename="${document.filename}"`,
    });
  }
}
