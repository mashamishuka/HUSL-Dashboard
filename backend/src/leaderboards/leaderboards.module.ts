import { BusinessesModule } from 'src/businesses/businesses.module';
import { FinancesModule } from 'src/finances/finances.module';
import { LeadsModule } from 'src/leads/leads.module';
import { SocialAccountsModule } from 'src/social-accounts/social-accounts.module';
import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LeaderboardsController } from './leaderboards.controller';
import { Leaderboard, LeaderboardSchema } from './leaderboards.schema';
import { LeaderboardsService } from './leaderboards.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Leaderboard.name, schema: LeaderboardSchema },
    ]),
    BusinessesModule,
    FinancesModule,
    SocialAccountsModule,
    UsersModule,
    LeadsModule,
  ],
  controllers: [LeaderboardsController],
  providers: [LeaderboardsService],
  exports: [LeaderboardsService],
})
export class LeaderboardsModule {}
