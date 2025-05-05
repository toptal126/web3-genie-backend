import { Module } from '@nestjs/common';
import { EvmService } from './evm.service';
import { ConfigModule } from '@nestjs/config';
import { AlchemyApiService } from '../third-party-api/alchemy.api.service';

@Module({
  imports: [ConfigModule],
  providers: [EvmService, AlchemyApiService],
  exports: [EvmService],
})
export class EvmModule {}
