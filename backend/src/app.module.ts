import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { AccountsModule } from './accounts/accounts.module';
import { ApiModule } from './api/api.module';
import { AuthModule } from './auth/auth.module';
import { BusinessesModule } from './businesses/businesses.module';
import { CourseParticipantsModule } from './course-participants/course-participants.module';
import { CoursesModule } from './courses/courses.module';
import { CronService } from './cron/cron.service';
import { FbadsModule } from './fbads/fbads.module';
import { FilesModule } from './files/files.module';
import { FinancesModule } from './finances/finances.module';
import { GAnalyticsConfigModule } from './ga-configs/ga-configs.module';
import { GraphicTemplatesModule } from './graphic-templates/graphic-templates.module';
import { HuslMailModule } from './husl-mails/husl-mails.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { LeadsModule } from './leads/leads.module';
import { NicheScriptsModule } from './niche-scripts/niche-scripts.module';
import { NichesModule } from './niches/niches.module';
import { OnboardingProgressesModule } from './onboarding-progresses/onboarding-progresses.module';
import { OnboardingsModule } from './onboardings/onboardings.module';
import { PayoutsModule } from './payouts/payouts.module';
import { ProductsModule } from './products/products.module';
import { PurchasesModule } from './purchases/purchases.module';
import { RoadmapsModule } from './roadmaps/roadmaps.module';
import { SettingsModule } from './settings/settings.module';
import { SocialAccountsModule } from './social-accounts/social-accounts.module';
import { StripeCustomersModule } from './stripe-customers/stripe-customers.module';
import { TipsntrickModule } from './tipsntricks/tipsntricks.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { WebsocketModule } from './websocket/websocket.module';
import { TeamsModule } from './teams/teams.module';
import { RewardsModule } from './rewards/rewards.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StripeMetaModule } from './stripe-meta/stripe-meta.module';
import { GoalTrackersModule } from './goal-trackers/goal-trackers.module';
import { ConnectionsModule } from './connections/connections.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    MongooseModule.forRoot(`mongodb+srv://${process.env.MONGO_HOST}/`, {
      dbName: process.env.MONGO_DBNAME,
      user: process.env.MONGO_USERNAME,
      pass: process.env.MONGO_PASSWORD,
      autoCreate: true,
    }),
    ScheduleModule.forRoot(),
    WalletsModule,
    AuthModule,
    AccountsModule,
    SocialAccountsModule,
    FilesModule,
    FbadsModule,
    HuslMailModule,
    UsersModule,
    FinancesModule,
    RoadmapsModule,
    TipsntrickModule,
    GAnalyticsConfigModule,
    PurchasesModule,
    StripeCustomersModule,
    ProductsModule,
    NichesModule,
    BusinessesModule,
    PayoutsModule,
    ApiModule,
    GraphicTemplatesModule,
    LeaderboardsModule,
    SettingsModule,
    OnboardingsModule,
    OnboardingProgressesModule,
    LeadsModule,
    NicheScriptsModule,
    CoursesModule,
    CourseParticipantsModule,
    WebsocketModule,
    TeamsModule,
    RewardsModule,
    StripeMetaModule,
    GoalTrackersModule,
    NotificationsModule,
    ConnectionsModule,
  ],
  providers: [CronService],
})
export class AppModule {}
