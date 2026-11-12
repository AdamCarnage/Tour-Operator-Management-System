import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../../common/auth-user';
import { CurrentUser, Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/enums';
import { EarningsService } from '../application/earnings.service';
import { EarningsQueryDto } from './earnings.dto';

@ApiTags('Earnings')
@ApiBearerAuth()
@Roles(RoleName.Accountant, RoleName.Sales, RoleName.Operations)
@Controller('earnings')
export class EarningsController {
  constructor(private readonly earnings: EarningsService) {}

  @Get('summary')
  summary(@CurrentUser() user: AuthUser, @Query() query: EarningsQueryDto) {
    return this.earnings.summary(user.organizationId, query);
  }

  @Get('payments')
  payments(@CurrentUser() user: AuthUser, @Query() query: EarningsQueryDto) {
    return this.earnings.listPayments(user.organizationId, query);
  }
}
