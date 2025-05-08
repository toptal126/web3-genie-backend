import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { OpenAIService } from './openai.service';
import { ConversationSchema } from './schemas/conversation.schema';
import { messageSchema } from './schemas/message.schema';
import { Web3Module } from '../web3/web3.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Conversation', schema: ConversationSchema },
      { name: 'Message', schema: messageSchema },
    ]),
    Web3Module,
    UserModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, OpenAIService],
  exports: [ChatService],
})
export class ChatModule {}
