import { SettingsModule } from 'src/settings/settings.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OnboardingsController } from './onboardings.controller';
import { Onboarding, OnboardingSchema } from './onboardings.schema';
import { OnboardingsService } from './onboardings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Onboarding.name, schema: OnboardingSchema },
    ]),
    SettingsModule,
  ],
  controllers: [OnboardingsController],
  providers: [OnboardingsService],
  exports: [OnboardingsService],
})
export class OnboardingsModule {}
