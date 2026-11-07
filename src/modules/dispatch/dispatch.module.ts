import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking, Traveler } from '../bookings/infrastructure/booking.entities';
import {
  StaffAvailability,
  StaffMember,
  Vehicle,
} from '../resources/infrastructure/resource.entities';
import { DispatchController } from './api/dispatch.controller';
import { DispatchService } from './application/dispatch.service';
import {
  Assignment,
  Departure,
  Manifest,
} from './infrastructure/dispatch.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Departure,
      Assignment,
      Manifest,
      Booking,
      Traveler,
      StaffMember,
      Vehicle,
      StaffAvailability,
    ]),
  ],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
