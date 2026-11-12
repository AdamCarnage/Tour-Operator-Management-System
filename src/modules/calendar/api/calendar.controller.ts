import {
  Body,
  Controller,
  Delete,
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
import { CalendarService } from '../application/calendar.service';
import {
  CalendarQueryDto,
  CreateCalendarItemDto,
  UpdateCalendarItemDto,
} from './calendar.dto';

@ApiTags('Calendar')
@ApiBearerAuth()
@Roles(RoleName.Operations, RoleName.Guide, RoleName.Sales)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: CalendarQueryDto) {
    return this.calendar.list(user.organizationId, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.calendar.get(user.organizationId, id);
  }

  @Post()
  @Roles(RoleName.Operations)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCalendarItemDto) {
    return this.calendar.create(user, dto);
  }

  @Patch(':id')
  @Roles(RoleName.Operations)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCalendarItemDto,
  ) {
    return this.calendar.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(RoleName.Operations)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.calendar.remove(user, id);
  }
}
