import { Module } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { EvmModule } from './evm/evm.module';
import { SolanaModule } from './solana/solana.module';

@Module({
  imports: [EvmModule, SolanaModule],
  providers: [Web3Service],
  exports: [Web3Service, EvmModule, SolanaModule],
})
export class Web3Module {}
