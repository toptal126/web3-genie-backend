import { AlchemyApiService } from '@modules/web3/third-party-api/alchemy.api.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';

@Injectable()
export class CronService {
  private instanceId = Math.random().toString(36).substring(7);

  constructor(private alchemyApiService: AlchemyApiService) {
    console.log(`CronService instance created with ID: ${this.instanceId}`);
  }

  @Cron(CronExpression.EVERY_MINUTE, { name: 'Fetch Top Tier Symbols' })
  async handleCron() {
    const currentTime = new Date().toLocaleString();
    console.log(`[Instance ${this.instanceId}] Current time: ${currentTime}`);
  }
}
