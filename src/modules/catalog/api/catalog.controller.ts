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
import { CatalogService } from '../application/catalog.service';
import {
  CreateDayDto,
  CreateProductDto,
  CreateServiceLineDto,
  CreateTemplateDto,
  UpdateProductDto,
} from './catalog.dto';

@ApiTags('Catalog')
@ApiBearerAuth()
@Roles(RoleName.Sales, RoleName.Operations)
@Controller('products')
export class ProductsController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.catalog.listProducts(
      user.organizationId,
      query.page,
      query.limit,
    );
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.catalog.createProduct(user, dto);
  }

  @Get(':productId')
  get(
    @CurrentUser() user: AuthUser,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.catalog.getProduct(user.organizationId, productId);
  }

  @Patch(':productId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.catalog.updateProduct(user, productId, dto);
  }

  @Get(':productId/templates')
  listTemplates(
    @CurrentUser() user: AuthUser,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.catalog.listTemplates(user.organizationId, productId);
  }

  @Post(':productId/templates')
  createTemplate(
    @CurrentUser() user: AuthUser,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.catalog.createTemplate(user, productId, dto);
  }
}

@ApiTags('Catalog')
@ApiBearerAuth()
@Roles(RoleName.Sales, RoleName.Operations)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly catalog: CatalogService) {}

  @Get(':templateId')
  get(
    @CurrentUser() user: AuthUser,
    @Param('templateId', ParseUUIDPipe) templateId: string,
  ) {
    return this.catalog.getTemplate(user.organizationId, templateId);
  }

  @Post(':templateId/days')
  createDay(
    @CurrentUser() user: AuthUser,
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() dto: CreateDayDto,
  ) {
    return this.catalog.createDay(user, templateId, dto);
  }
}

@ApiTags('Catalog')
@ApiBearerAuth()
@Roles(RoleName.Sales, RoleName.Operations)
@Controller('days')
export class DaysController {
  constructor(private readonly catalog: CatalogService) {}

  @Post(':dayId/service-lines')
  createLine(
    @CurrentUser() user: AuthUser,
    @Param('dayId', ParseUUIDPipe) dayId: string,
    @Body() dto: CreateServiceLineDto,
  ) {
    return this.catalog.createLine(user, dayId, dto);
  }
}
