import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';

@Injectable()
export class CronService {
  private instanceId = Math.random().toString(36).substring(7);

  constructor() {
    console.log(`CronService instance created with ID: ${this.instanceId}`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const currentTime = new Date().toLocaleString();
    console.log(`[Instance ${this.instanceId}] Current time: ${currentTime}`);
  }
}
