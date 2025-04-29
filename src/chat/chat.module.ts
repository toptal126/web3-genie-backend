import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { OpenAIService } from './openai.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [ChatController],
  providers: [ChatService,ConfigService, OpenAIService],
  exports: [ChatService],
})
export class ChatModule {}
