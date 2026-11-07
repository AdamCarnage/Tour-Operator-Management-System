import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../../common/auth-user';
import { CurrentUser, Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/enums';
import { PageQueryDto } from '../../../common/page-query.dto';
import { QuotesService } from '../application/quotes.service';
import {
  AcceptQuoteDto,
  CreateQuoteDto,
  CreateQuoteFromTemplateDto,
  CreateQuoteLineDto,
} from './quote.dto';

@ApiTags('Quotes')
@ApiBearerAuth()
@Roles(RoleName.Sales)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.quotes.list(user.organizationId, query.page, query.limit);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateQuoteDto) {
    return this.quotes.create(user, dto);
  }

  @Post('from-template')
  fromTemplate(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateQuoteFromTemplateDto,
  ) {
    return this.quotes.createFromTemplate(user, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.quotes.get(user.organizationId, id);
  }

  @Post(':id/send')
  send(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.quotes.send(user, id);
  }

  @Post(':id/accept')
  accept(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AcceptQuoteDto,
  ) {
    return this.quotes.accept(user, id, dto);
  }

  @Post(':id/versions/:versionId/lines')
  addLine(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @Body() dto: CreateQuoteLineDto,
  ) {
    return this.quotes.addLine(user, id, versionId, dto);
  }
}
