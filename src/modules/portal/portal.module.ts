import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, Payment } from '../bookings/infrastructure/booking.entities';
import {
  Quote,
  QuoteLine,
  QuoteVersion,
} from '../quotes/infrastructure/quote.entities';
import { PortalController } from './api/portal.controller';
import { PortalService } from './application/portal.service';
import { ClientFeedback, PortalToken } from './infrastructure/portal.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PortalToken,
      ClientFeedback,
      Quote,
      QuoteVersion,
      QuoteLine,
      Booking,
      Payment,
    ]),
  ],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
