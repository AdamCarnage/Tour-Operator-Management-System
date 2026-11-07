import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departure } from '../dispatch/infrastructure/dispatch.entities';
import { SafetyController } from './api/safety.controller';
import { SafetyService } from './application/safety.service';
import {
  HealthLog,
  Incident,
  LoadRecord,
  LocationPing,
  SafetyChecklist,
} from './infrastructure/safety.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SafetyChecklist,
      HealthLog,
      Incident,
      LoadRecord,
      LocationPing,
      Departure,
    ]),
  ],
  controllers: [SafetyController],
  providers: [SafetyService],
})
export class SafetyModule {}
