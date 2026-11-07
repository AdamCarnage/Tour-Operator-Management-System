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
import { ResourcesService } from '../application/resources.service';
import {
  CreateAvailabilityDto,
  CreateCertificationDto,
  CreateGearDto,
  CreateStaffDto,
  CreateVehicleDto,
  ExpiringQueryDto,
  UpdateActiveDto,
} from './resource.dto';

@ApiTags('Resources')
@ApiBearerAuth()
@Roles(RoleName.Operations)
@Controller('staff')
export class StaffController {
  constructor(private readonly resources: ResourcesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.resources.listStaff(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Get('certifications/expiring')
  expiring(@CurrentUser() user: AuthUser, @Query() query: ExpiringQueryDto) {
    return this.resources.expiringCertifications(
      user.organizationId,
      query.withinDays ?? 30,
    );
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateStaffDto) {
    return this.resources.createStaff(user, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.resources.getStaff(user.organizationId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActiveDto,
  ) {
    return this.resources.updateStaff(user, id, dto);
  }

  @Get(':id/certifications')
  certifications(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.resources.listCertifications(user.organizationId, id);
  }

  @Post(':id/certifications')
  addCertification(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCertificationDto,
  ) {
    return this.resources.addCertification(user, id, dto);
  }

  @Post(':id/availability')
  addAvailability(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.resources.addAvailability(user, id, dto);
  }
}

@ApiTags('Resources')
@ApiBearerAuth()
@Roles(RoleName.Operations)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly resources: ResourcesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.resources.listVehicles(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateVehicleDto) {
    return this.resources.createVehicle(user, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActiveDto,
  ) {
    return this.resources.updateVehicle(user, id, dto);
  }
}

@ApiTags('Resources')
@ApiBearerAuth()
@Roles(RoleName.Operations)
@Controller('gear')
export class GearController {
  constructor(private readonly resources: ResourcesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.resources.listGear(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateGearDto) {
    return this.resources.createGear(user, dto);
  }
}
