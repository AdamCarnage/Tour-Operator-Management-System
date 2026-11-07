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
import { SafetyService } from '../application/safety.service';
import {
  CreateChecklistDto,
  CreateHealthLogDto,
  CreateIncidentDto,
  CreateLoadDto,
  CreateLocationDto,
  UpdateIncidentDto,
} from './safety.dto';

@ApiTags('Safety')
@ApiBearerAuth()
@Roles(RoleName.Operations, RoleName.Guide)
@Controller('safety')
export class SafetyController {
  constructor(private readonly safety: SafetyService) {}

  @Get('checklists')
  checklists(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.safety.listChecklists(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Post('checklists')
  createChecklist(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateChecklistDto,
  ) {
    return this.safety.createChecklist(user, dto);
  }

  @Get('health-logs')
  healthLogs(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.safety.listHealthLogs(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Post('health-logs')
  createHealthLog(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateHealthLogDto,
  ) {
    return this.safety.createHealthLog(user, dto);
  }

  @Get('incidents')
  incidents(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.safety.listIncidents(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Post('incidents')
  createIncident(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.safety.createIncident(user, dto);
  }

  @Patch('incidents/:id')
  updateIncident(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.safety.updateIncident(user, id, dto);
  }

  @Get('loads')
  loads(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.safety.listLoads(user.organizationId, query.page, query.limit);
  }

  @Post('loads')
  createLoad(@CurrentUser() user: AuthUser, @Body() dto: CreateLoadDto) {
    return this.safety.createLoad(user, dto);
  }

  @Get('departures/:departureId/locations')
  locations(
    @CurrentUser() user: AuthUser,
    @Param('departureId', ParseUUIDPipe) departureId: string,
  ) {
    return this.safety.listLocations(user.organizationId, departureId);
  }

  @Post('locations')
  createLocation(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateLocationDto,
  ) {
    return this.safety.createLocation(user, dto);
  }
}
