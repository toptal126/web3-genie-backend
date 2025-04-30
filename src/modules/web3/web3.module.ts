import { Module } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { EvmModule } from './evm/evm.module';
import { SolanaModule } from './solana/solana.module';
import { DatabaseModule } from '../database/database.module';
import { AlchemyModule } from './alchemy/alchemy.module';
import { SystemConfigModule } from '../database/system-config.module';
import { Web3Controller } from './web3.controller';

@Module({
  imports: [
    EvmModule,
    SolanaModule,
    DatabaseModule,
    AlchemyModule,
    SystemConfigModule,
  ],
  controllers: [Web3Controller],
  providers: [Web3Service],
  exports: [Web3Service],
})
export class Web3Module {}
