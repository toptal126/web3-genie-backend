import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { Web3Module } from './modules/web3/web3.module';
import { AdminModule } from './modules/admin/admin.module';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { NewsModule } from './modules/news/news.module';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    Web3Module,
    AdminModule,
    DatabaseModule,
    UserModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
