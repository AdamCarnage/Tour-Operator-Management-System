import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  GearController,
  StaffController,
  VehiclesController,
} from './api/resources.controller';
import { ResourcesService } from './application/resources.service';
import {
  Certification,
  GearItem,
  StaffAvailability,
  StaffMember,
  Vehicle,
} from './infrastructure/resource.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StaffMember,
      Certification,
      StaffAvailability,
      Vehicle,
      GearItem,
    ]),
  ],
  controllers: [StaffController, VehiclesController, GearController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
