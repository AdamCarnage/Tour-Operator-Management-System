import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Booking,
  Payment,
} from '../bookings/infrastructure/booking.entities';
import { Product } from '../catalog/infrastructure/catalog.entities';
import { Customer, Lead } from '../crm/infrastructure/crm.entities';
import {
  Assignment,
  Departure,
} from '../dispatch/infrastructure/dispatch.entities';
import {
  Organization,
  User,
} from '../identity/infrastructure/identity.entities';
import { Quote } from '../quotes/infrastructure/quote.entities';
import {
  StaffMember,
  Vehicle,
} from '../resources/infrastructure/resource.entities';
import { DashboardController } from './api/dashboard.controller';
import { DashboardService } from './application/dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      Payment,
      Quote,
      Lead,
      Customer,
      Product,
      Departure,
      Assignment,
      StaffMember,
      Vehicle,
      Organization,
      User,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
