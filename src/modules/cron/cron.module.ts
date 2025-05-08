import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AlchemyApiService } from '@modules/web3/third-party-api/alchemy.api.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule],
  providers: [CronService, AlchemyApiService],
  exports: [CronService],
})
export class CronModule {}
