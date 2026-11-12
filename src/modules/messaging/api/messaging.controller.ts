import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../../common/auth-user';
import { CurrentUser, Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/enums';
import { PageQueryDto } from '../../../common/page-query.dto';
import { MessagingService } from '../application/messaging.service';
import {
  ConversationQueryDto,
  CreateConversationDto,
  IngestExternalMessageDto,
  SendMessageDto,
} from './messaging.dto';

@ApiTags('Messages')
@ApiBearerAuth()
@Roles(
  RoleName.Sales,
  RoleName.Operations,
  RoleName.Accountant,
  RoleName.Guide,
  RoleName.Driver,
)
@Controller('messages')
export class MessagingController {
  constructor(private readonly messaging: MessagingService) {}

  @Get('unread-count')
  unreadCount(@CurrentUser() user: AuthUser) {
    return this.messaging.unreadCount(user);
  }

  @Get('conversations')
  listConversations(
    @CurrentUser() user: AuthUser,
    @Query() query: ConversationQueryDto,
  ) {
    return this.messaging.listConversations(
      user,
      query.page,
      query.limit,
      query.channel,
    );
  }

  @Post('conversations')
  createConversation(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messaging.createConversation(user, dto);
  }

  @Get('conversations/:id')
  getConversation(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.messaging.getConversation(user, id);
  }

  @Get('conversations/:id/messages')
  listMessages(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PageQueryDto,
  ) {
    return this.messaging.listMessages(user, id, query.page, query.limit);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messaging.sendMessage(user, id, dto);
  }

  @Patch('conversations/:id/read')
  markRead(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.messaging.markRead(user, id);
  }

  @Post('ingest')
  @Roles(RoleName.Sales, RoleName.Operations, RoleName.Admin)
  ingestExternal(
    @CurrentUser() user: AuthUser,
    @Body() dto: IngestExternalMessageDto,
  ) {
    return this.messaging.ingestExternal(user, dto);
  }
}
