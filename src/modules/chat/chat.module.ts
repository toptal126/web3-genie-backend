import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { OpenAIService } from './openai.service';
import { ConfigService } from '@nestjs/config';
import { ConversationModel } from './models/conversation.model';
import { MessageModel } from './models/message.model';
import {
  Conversation,
  ConversationSchema,
} from '../database/schemas/conversation.schema';
import { Message, MessageSchema } from '../database/schemas/message.schema';
import { SystemConfigModule } from '../database/system-config.module';
import { Web3Module } from '../web3/web3.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    SystemConfigModule,
    Web3Module,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ConfigService,
    OpenAIService,
    ConversationModel,
    MessageModel,
  ],
  exports: [ChatService],
})
export class ChatModule {}
