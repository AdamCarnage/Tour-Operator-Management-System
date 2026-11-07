import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departure } from '../dispatch/infrastructure/dispatch.entities';
import { PermitsController } from './api/permits.controller';
import { PermitsService } from './application/permits.service';
import {
  ControlNumber,
  ParkFeeLine,
  ParkPermit,
} from './infrastructure/permit.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ParkPermit,
      ParkFeeLine,
      ControlNumber,
      Departure,
    ]),
  ],
  controllers: [PermitsController],
  providers: [PermitsService],
})
export class PermitsModule {}
