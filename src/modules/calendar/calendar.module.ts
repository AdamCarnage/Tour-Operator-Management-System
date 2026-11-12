import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarController } from './api/calendar.controller';
import { CalendarService } from './application/calendar.service';
import { CalendarItem } from './infrastructure/calendar.entities';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarItem])],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
