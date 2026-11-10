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
import { SuppliersService } from '../application/suppliers.service';
import {
  CreatePayableDto,
  CreatePropertyDto,
  CreateRateDto,
  CreateRoomTypeDto,
  CreateSupplierDto,
  CreateSupplierRequestDto,
  UpdatePayableDto,
  UpdateSupplierRequestDto,
} from './supplier.dto';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Roles(RoleName.Sales, RoleName.Operations, RoleName.Accountant)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.suppliers.list(user.organizationId, query.page, query.limit);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSupplierDto) {
    return this.suppliers.create(user, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.suppliers.get(user.organizationId, id);
  }

  @Get(':id/properties')
  listProperties(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.suppliers.listProperties(user.organizationId, id);
  }

  @Post(':id/properties')
  createProperty(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePropertyDto,
  ) {
    return this.suppliers.createProperty(user, id, dto);
  }

  @Post(':id/rates')
  createRate(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRateDto,
  ) {
    return this.suppliers.createRate(user, id, dto);
  }

  @Get(':id/rates')
  listRates(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.suppliers.listRates(user.organizationId, id);
  }
}

@ApiTags('Suppliers')
@ApiBearerAuth()
@Roles(RoleName.Sales, RoleName.Operations)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Post(':id/room-types')
  createRoomType(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateRoomTypeDto,
  ) {
    return this.suppliers.createRoomType(user, id, dto);
  }
}

@ApiTags('Suppliers')
@ApiBearerAuth()
@Roles(RoleName.Operations, RoleName.Accountant)
@Controller('supplier-requests')
export class SupplierRequestsController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.suppliers.listRequests(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSupplierRequestDto) {
    return this.suppliers.createRequest(user, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierRequestDto,
  ) {
    return this.suppliers.updateRequest(user, id, dto);
  }
}

@ApiTags('Suppliers')
@ApiBearerAuth()
@Roles(RoleName.Accountant, RoleName.Operations)
@Controller('payables')
export class PayablesController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.suppliers.listPayables(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePayableDto) {
    return this.suppliers.createPayable(user, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePayableDto,
  ) {
    return this.suppliers.updatePayable(user, id, dto);
  }
}
