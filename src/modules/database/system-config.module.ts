import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemConfigModel } from './models/system-config.model';
import { SystemConfig, SystemConfigSchema } from './schemas/system-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemConfig.name, schema: SystemConfigSchema },
    ]),
  ],
  providers: [SystemConfigModel],
  exports: [SystemConfigModel],
})
export class SystemConfigModule {} 