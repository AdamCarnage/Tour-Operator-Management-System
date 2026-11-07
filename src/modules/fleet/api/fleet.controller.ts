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
import { FleetService } from '../application/fleet.service';
import {
  CreateFuelLogDto,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
} from './fleet.dto';

@ApiTags('Fleet')
@ApiBearerAuth()
@Roles(RoleName.Operations, RoleName.Driver)
@Controller('fleet')
export class FleetController {
  constructor(private readonly fleet: FleetService) {}

  @Get('maintenance')
  tasks(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.fleet.listTasks(user.organizationId, query.page, query.limit);
  }

  @Post('maintenance')
  @Roles(RoleName.Operations)
  createTask(@CurrentUser() user: AuthUser, @Body() dto: CreateMaintenanceDto) {
    return this.fleet.createTask(user, dto);
  }

  @Patch('maintenance/:id')
  @Roles(RoleName.Operations)
  updateTask(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceDto,
  ) {
    return this.fleet.updateTask(user, id, dto);
  }

  @Get('fuel')
  fuel(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.fleet.listFuel(user.organizationId, query.page, query.limit);
  }

  @Post('fuel')
  createFuel(@CurrentUser() user: AuthUser, @Body() dto: CreateFuelLogDto) {
    return this.fleet.createFuel(user, dto);
  }
}
