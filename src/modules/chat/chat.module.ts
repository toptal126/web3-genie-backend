import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { OpenAIService } from './openai.service';
import { ConversationSchema } from '../database/schemas/conversation.schema';
import { messageSchema } from '../database/schemas/message.schema';
import { Web3Module } from '../web3/web3.module';
import { UserModule } from '../user/user.module';
import { SystemConfigModule } from '../database/system-config.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Conversation', schema: ConversationSchema },
      { name: 'Message', schema: messageSchema },
    ]),
    SystemConfigModule,
    Web3Module,
    UserModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, OpenAIService],
  exports: [ChatService],
})
export class ChatModule {}
