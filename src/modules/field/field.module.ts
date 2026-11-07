import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departure } from '../dispatch/infrastructure/dispatch.entities';
import { FieldController } from './api/field.controller';
import { FieldService } from './application/field.service';
import {
  FieldCheckIn,
  FieldExpense,
  FieldInspection,
} from './infrastructure/field.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FieldCheckIn,
      FieldExpense,
      FieldInspection,
      Departure,
    ]),
  ],
  controllers: [FieldController],
  providers: [FieldService],
})
export class FieldModule {}
