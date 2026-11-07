import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController, LeadsController } from './api/crm.controller';
import { CrmService } from './application/crm.service';
import { Communication, Customer, Lead } from './infrastructure/crm.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Lead, Communication])],
  controllers: [CustomersController, LeadsController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
