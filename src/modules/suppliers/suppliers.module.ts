import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PayablesController,
  PropertiesController,
  SupplierRequestsController,
  SuppliersController,
} from './api/suppliers.controller';
import { SuppliersService } from './application/suppliers.service';
import {
  Payable,
  Property,
  RoomType,
  SeasonalRate,
  Supplier,
  SupplierRequest,
} from './infrastructure/supplier.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier,
      Property,
      RoomType,
      SeasonalRate,
      SupplierRequest,
      Payable,
    ]),
  ],
  controllers: [
    SuppliersController,
    PropertiesController,
    SupplierRequestsController,
    PayablesController,
  ],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
