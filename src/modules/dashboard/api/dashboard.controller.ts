import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../../common/auth-user';
import { CurrentUser, Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/enums';
import { DashboardService } from '../application/dashboard.service';
import {
  AdventurerDashboardQueryDto,
  OperatorDashboardQueryDto,
} from './dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('operator')
  @Roles(
    RoleName.Sales,
    RoleName.Operations,
    RoleName.Accountant,
    RoleName.Guide,
  )
  operator(
    @CurrentUser() user: AuthUser,
    @Query() query: OperatorDashboardQueryDto,
  ) {
    return this.dashboard.operator(user.organizationId, query.asOf);
  }

  @Get('adventurer')
  @Roles(RoleName.Sales, RoleName.Operations, RoleName.Admin)
  adventurer(
    @CurrentUser() user: AuthUser,
    @Query() query: AdventurerDashboardQueryDto,
  ) {
    return this.dashboard.adventurer(user.organizationId, query.customerId);
  }

  @Get('platform')
  @Roles(RoleName.PlatformAdmin)
  platform() {
    return this.dashboard.platform();
  }
}
