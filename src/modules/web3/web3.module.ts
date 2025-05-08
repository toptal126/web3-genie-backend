import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { EvmModule } from './evm/evm.module';
import { SolanaModule } from './solana/solana.module';
import { Web3Controller } from './web3.controller';
import { Web3Service } from './web3.service';
import { AlchemyApiService } from './third-party-api/alchemy.api.service';
import { SolscanApiService } from './third-party-api/solscan.api.service';
import { PumpFunApiService } from './third-party-api/pumpfun.api.service';
import { HeliusApiService } from './third-party-api/helius.api.service';
import { SolanaFMApiService } from './third-party-api/solanafm.api.service';
import { MoralisApiService } from './third-party-api/moralis.api.service';

@Module({
  imports: [EvmModule, SolanaModule, ConfigModule, HttpModule],
  controllers: [Web3Controller],
  providers: [
    Web3Service,
    AlchemyApiService,
    SolscanApiService,
    PumpFunApiService,
    HeliusApiService,
    SolanaFMApiService,
    MoralisApiService,
  ],
  exports: [
    Web3Service,
    AlchemyApiService,
    SolscanApiService,
    PumpFunApiService,
    HeliusApiService,
    SolanaFMApiService,
    MoralisApiService,
  ],
})
export class Web3Module {}
