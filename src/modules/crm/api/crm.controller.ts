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
import { CrmService } from '../application/crm.service';
import {
  CreateCommunicationDto,
  CreateCustomerDto,
  CreateLeadDto,
  LeadQueryDto,
  UpdateCustomerDto,
  UpdateLeadDto,
} from './crm.dto';

@ApiTags('CRM')
@ApiBearerAuth()
@Roles(RoleName.Sales)
@Controller('customers')
export class CustomersController {
  constructor(private readonly crm: CrmService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.crm.listCustomers(user.organizationId, query.page, query.limit);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCustomerDto) {
    return this.crm.createCustomer(user, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.crm.getCustomer(user.organizationId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.crm.updateCustomer(user, id, dto);
  }
}

@ApiTags('CRM')
@ApiBearerAuth()
@Roles(RoleName.Sales)
@Controller('leads')
export class LeadsController {
  constructor(private readonly crm: CrmService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: LeadQueryDto) {
    return this.crm.listLeads(
      user.organizationId,
      query.page,
      query.limit,
      query.status,
    );
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLeadDto) {
    return this.crm.createLead(user, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.crm.getLead(user.organizationId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.crm.updateLead(user, id, dto);
  }

  @Get(':id/communications')
  communications(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.crm.listCommunications(user.organizationId, id);
  }

  @Post(':id/communications')
  addCommunication(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCommunicationDto,
  ) {
    return this.crm.addCommunication(user, id, dto);
  }
}
