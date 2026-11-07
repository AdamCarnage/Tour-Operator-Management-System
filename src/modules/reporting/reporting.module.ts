import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/infrastructure/booking.entities';
import { Lead } from '../crm/infrastructure/crm.entities';
import {
  Assignment,
  Departure,
} from '../dispatch/infrastructure/dispatch.entities';
import { Quote } from '../quotes/infrastructure/quote.entities';
import {
  StaffMember,
  Vehicle,
} from '../resources/infrastructure/resource.entities';
import { Payable } from '../suppliers/infrastructure/supplier.entities';
import { ReportingController } from './api/reporting.controller';
import { ReportingService } from './application/reporting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      Quote,
      Booking,
      Departure,
      Assignment,
      StaffMember,
      Vehicle,
      Payable,
    ]),
  ],
  controllers: [ReportingController],
  providers: [ReportingService],
})
export class ReportingModule {}
