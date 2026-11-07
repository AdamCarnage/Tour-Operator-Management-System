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
import { DispatchService } from '../application/dispatch.service';
import {
  CreateAssignmentDto,
  CreateDepartureDto,
  UpdateDepartureDto,
} from './dispatch.dto';

@ApiTags('Dispatch')
@ApiBearerAuth()
@Roles(RoleName.Operations, RoleName.Guide, RoleName.Driver)
@Controller('departures')
export class DispatchController {
  constructor(private readonly dispatch: DispatchService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.dispatch.list(user.organizationId, query.page, query.limit);
  }

  @Post()
  @Roles(RoleName.Operations)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDepartureDto) {
    return this.dispatch.create(user, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.dispatch.get(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(RoleName.Operations)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartureDto,
  ) {
    return this.dispatch.update(user, id, dto);
  }

  @Post(':id/assignments')
  @Roles(RoleName.Operations)
  assign(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.dispatch.assign(user, id, dto);
  }

  @Post(':id/manifest')
  @Roles(RoleName.Operations)
  manifest(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dispatch.manifest(user, id);
  }
}
