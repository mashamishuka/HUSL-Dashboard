import { ConnectionsModule } from 'src/connections/connections.module';
import { FinancesModule } from 'src/finances/finances.module';
import { RewardsModule } from 'src/rewards/rewards.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GoalTrackersController } from './goal-trackers.controller';
import { GoalTracker, GoalTrackerSchema } from './goal-trackers.schema';
import { GoalTrackersService } from './goal-trackers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GoalTracker.name, schema: GoalTrackerSchema },
    ]),
    FinancesModule,
    ConnectionsModule,
    RewardsModule,
  ],
  controllers: [GoalTrackersController],
  providers: [GoalTrackersService],
  exports: [GoalTrackersService],
})
export class GoalTrackersModule {}
