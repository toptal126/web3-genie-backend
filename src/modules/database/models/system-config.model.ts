import { Model } from 'mongoose';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SystemConfig } from '../schemas/system-config.schema';

@Injectable()
export class SystemConfigModel implements OnModuleInit {
  constructor(
    @InjectModel(SystemConfig.name) private systemConfigModel: Model<SystemConfig>,
  ) {}

  async onModuleInit() {
    await this.initializeDefaultConfigs();
  }

  private async initializeDefaultConfigs() {
    const defaultConfigs = [
      {
        key: 'system_prompt',
        value: 'You are a helpful AI assistant with Web3 knowledge.',
      },
      { key: 'web3_enabled', value: 'true' },
      { key: 'web_search_enabled', value: 'false' },
    ];

    for (const config of defaultConfigs) {
      await this.systemConfigModel.findOneAndUpdate(
        { key: config.key },
        { $set: config },
        { upsert: true },
      );
    }
  }

  async get(key: string): Promise<string | null> {
    const config = await this.systemConfigModel.findOne({ key }).exec();
    return config?.value || null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.systemConfigModel.findOneAndUpdate(
      { key },
      { $set: { value } },
      { upsert: true },
    );
  }
} 