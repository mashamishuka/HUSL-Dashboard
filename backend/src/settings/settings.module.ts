import { GAnalyticsConfigModule } from 'src/ga-configs/ga-configs.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SettingsController } from './settings.controller';
import { Setting, SettingSchema } from './settings.schema';
import { SettingsService } from './settings.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
    GAnalyticsConfigModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
