import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Booking,
  Payment,
} from '../bookings/infrastructure/booking.entities';
import { User } from '../identity/infrastructure/identity.entities';
import { EarningsController } from './api/earnings.controller';
import { EarningsService } from './application/earnings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Booking, User])],
  controllers: [EarningsController],
  providers: [EarningsService],
  exports: [EarningsService],
})
export class EarningsModule {}
