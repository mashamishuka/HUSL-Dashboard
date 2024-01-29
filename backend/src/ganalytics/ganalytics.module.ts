import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GAnalyticsController } from './ganalytics.controller';
import { GAnalytic, GAnalyticSchema } from './ganalytics.schema';
import { GAnalyticsService } from './ganalytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GAnalytic.name, schema: GAnalyticSchema },
    ]),
    UsersModule,
  ],
  controllers: [GAnalyticsController],
  providers: [GAnalyticsService],
})
export class GAnalyticsModule {}
