import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './api/bookings.controller';
import { BookingsService } from './application/bookings.service';
import {
  Booking,
  Invoice,
  Payment,
  Traveler,
} from './infrastructure/booking.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Traveler, Payment, Invoice])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
