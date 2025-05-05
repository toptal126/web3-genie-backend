import { Module } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { EvmModule } from './evm/evm.module';
import { SolanaModule } from './solana/solana.module';
import { DatabaseModule } from '../database/database.module';
import { SystemConfigModule } from '../database/system-config.module';
import { Web3Controller } from './web3.controller';
import { ConfigModule } from '@nestjs/config';
import { AlchemyApiService } from './third-party-api/alchemy.api.service';
import { SolscanApiService } from './third-party-api/solscan.api.service';
import { PumpFunApiService } from './third-party-api/pumpfun.api.service';

@Module({
  imports: [
    EvmModule,
    SolanaModule,
    DatabaseModule,
    SystemConfigModule,
    ConfigModule,
  ],
  controllers: [Web3Controller],
  providers: [
    Web3Service,
    AlchemyApiService,
    SolscanApiService,
    PumpFunApiService,
  ],
  exports: [Web3Service],
})
export class Web3Module {}
