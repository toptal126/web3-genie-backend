import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import {
  WalletSession,
  WalletSessionSchema,
} from './entities/wallet-session.entity';
import { SolanaModule } from '../web3/solana/solana.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WalletSession.name, schema: WalletSessionSchema },
    ]),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    UserModule,
    SolanaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
