import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../../common/auth-user';
import { CurrentUser, Roles } from '../../../common/decorators';
import { RoleName } from '../../../common/enums';
import { PageQueryDto } from '../../../common/page-query.dto';
import { FieldService } from '../application/field.service';
import {
  CreateCheckInDto,
  CreateFieldExpenseDto,
  CreateFieldInspectionDto,
} from './field.dto';

@ApiTags('Field')
@ApiBearerAuth()
@Roles(RoleName.Operations, RoleName.Guide, RoleName.Driver)
@Controller('field')
export class FieldController {
  constructor(private readonly field: FieldService) {}

  @Get('check-ins')
  checkIns(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.field.listCheckIns(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Post('check-ins')
  checkIn(@CurrentUser() user: AuthUser, @Body() dto: CreateCheckInDto) {
    return this.field.checkIn(user, dto);
  }

  @Get('expenses')
  expenses(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.field.listExpenses(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Post('expenses')
  addExpense(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateFieldExpenseDto,
  ) {
    return this.field.addExpense(user, dto);
  }

  @Get('inspections')
  inspections(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.field.listInspections(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Post('inspections')
  addInspection(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateFieldInspectionDto,
  ) {
    return this.field.addInspection(user, dto);
  }
}
