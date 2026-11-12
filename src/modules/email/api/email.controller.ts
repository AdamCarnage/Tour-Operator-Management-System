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
import { EmailService } from '../application/email.service';
import {
  CreateMailboxDto,
  EmailQueryDto,
  IngestEmailDto,
  UpdateEmailDto,
} from './email.dto';

@ApiTags('Email')
@ApiBearerAuth()
@Roles(RoleName.Sales, RoleName.Operations, RoleName.Admin)
@Controller('emails')
export class EmailController {
  constructor(private readonly email: EmailService) {}

  @Get('mailboxes')
  listMailboxes(@CurrentUser() user: AuthUser) {
    return this.email.listMailboxes(user.organizationId);
  }

  @Post('mailboxes')
  createMailbox(@CurrentUser() user: AuthUser, @Body() dto: CreateMailboxDto) {
    return this.email.createMailbox(user, dto);
  }

  @Get('folder-counts')
  folderCounts(@CurrentUser() user: AuthUser) {
    return this.email.folderCounts(user.organizationId);
  }

  @Post('ingest')
  ingest(@CurrentUser() user: AuthUser, @Body() dto: IngestEmailDto) {
    return this.email.ingest(user, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: EmailQueryDto) {
    return this.email.listEmails(user.organizationId, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.email.getEmail(user.organizationId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmailDto,
  ) {
    return this.email.updateEmail(user, id, dto);
  }
}
