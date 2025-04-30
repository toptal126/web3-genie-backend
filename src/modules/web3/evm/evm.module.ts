import { Module } from '@nestjs/common';
import { EvmService } from './evm.service';
import { AlchemyModule } from '../alchemy/alchemy.module';

@Module({
  imports: [AlchemyModule],
  providers: [EvmService],
  exports: [EvmService],
})
export class EvmModule {}
