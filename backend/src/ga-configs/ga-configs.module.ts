import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GAnalyticsConfigController } from './ga-configs.controller';
import { GAnalyticConfig, GAnalyticConfigSchema } from './ga-configs.schema';
import { GAnalyticsConfigService } from './ga-configs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GAnalyticConfig.name, schema: GAnalyticConfigSchema },
    ]),
    UsersModule,
  ],
  controllers: [GAnalyticsConfigController],
  providers: [GAnalyticsConfigService],
  exports: [GAnalyticsConfigService],
})
export class GAnalyticsConfigModule {}
