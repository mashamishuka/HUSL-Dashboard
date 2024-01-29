import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RewardsController } from './rewards.controller';
import { Rewards, RewardsSchema } from './rewards.schema';
import { RewardsService } from './rewards.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rewards.name, schema: RewardsSchema }]),
    UsersModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
