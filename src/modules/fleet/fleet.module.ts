import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../resources/infrastructure/resource.entities';
import { FleetController } from './api/fleet.controller';
import { FleetService } from './application/fleet.service';
import { FuelLog, MaintenanceTask } from './infrastructure/fleet.entities';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceTask, FuelLog, Vehicle])],
  controllers: [FleetController],
  providers: [FleetService],
})
export class FleetModule {}
