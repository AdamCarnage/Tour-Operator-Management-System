import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/infrastructure/booking.entities';
import {
  ItineraryDay,
  ItineraryTemplate,
  ServiceLine,
} from '../catalog/infrastructure/catalog.entities';
import { Customer, Lead } from '../crm/infrastructure/crm.entities';
import { QuotesController } from './api/quotes.controller';
import { QuotesService } from './application/quotes.service';
import {
  Quote,
  QuoteLine,
  QuoteVersion,
} from './infrastructure/quote.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quote,
      QuoteVersion,
      QuoteLine,
      Customer,
      Lead,
      ItineraryTemplate,
      ItineraryDay,
      ServiceLine,
      Booking,
    ]),
  ],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
