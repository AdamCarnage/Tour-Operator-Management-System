import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../../common/auth-user';
import { CurrentUser, Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/enums';
import { ReportingService } from '../application/reporting.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Roles(RoleName.Accountant, RoleName.Operations)
@Controller('reports')
export class ReportingController {
  constructor(private readonly reporting: ReportingService) {}

  @Get('funnel')
  funnel(@CurrentUser() user: AuthUser) {
    return this.reporting.funnel(user.organizationId);
  }

  @Get('margins')
  margins(@CurrentUser() user: AuthUser) {
    return this.reporting.margins(user.organizationId);
  }

  @Get('utilization')
  utilization(@CurrentUser() user: AuthUser) {
    return this.reporting.utilization(user.organizationId);
  }

  @Get('supplier-spend')
  supplierSpend(@CurrentUser() user: AuthUser) {
    return this.reporting.supplierSpend(user.organizationId);
  }
}
