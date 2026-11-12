import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingController } from './api/messaging.controller';
import { MessagingService } from './application/messaging.service';
import {
  ChatMessage,
  Conversation,
  ConversationParticipant,
} from './infrastructure/messaging.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      ConversationParticipant,
      ChatMessage,
    ]),
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
