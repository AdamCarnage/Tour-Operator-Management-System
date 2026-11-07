import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DaysController,
  ProductsController,
  TemplatesController,
} from './api/catalog.controller';
import { CatalogService } from './application/catalog.service';
import {
  ItineraryDay,
  ItineraryTemplate,
  Product,
  ServiceLine,
} from './infrastructure/catalog.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ItineraryTemplate,
      ItineraryDay,
      ServiceLine,
    ]),
  ],
  controllers: [ProductsController, TemplatesController, DaysController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
