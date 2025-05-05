import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SolanaService } from './solana.service';
import { SolanaController } from './solana.controller';
import { AlchemyApiService } from '../third-party-api/alchemy.api.service';
import { SolscanApiService } from '../third-party-api/solscan.api.service';
import { PumpFunApiService } from '../third-party-api/pumpfun.api.service';

@Module({
  imports: [ConfigModule],
  controllers: [SolanaController],
  providers: [
    SolanaService,
    AlchemyApiService,
    SolscanApiService,
    PumpFunApiService,
  ],
  exports: [SolanaService],
})
export class SolanaModule {}
