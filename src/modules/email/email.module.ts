import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailController } from './api/email.controller';
import { EmailService } from './application/email.service';
import { EmailMessage, Mailbox } from './infrastructure/email.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Mailbox, EmailMessage])],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
