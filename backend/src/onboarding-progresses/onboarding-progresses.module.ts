import { BusinessesModule } from 'src/businesses/businesses.module';
import { OnboardingsModule } from 'src/onboardings/onboardings.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OnboardingProgressesController } from './onboarding-progresses.controller';
import {
  OnboardingProgress,
  OnboardingProgressSchema,
} from './onboarding-progresses.schema';
import { OnboardingProgressesService } from './onboarding-progresses.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnboardingProgress.name, schema: OnboardingProgressSchema },
    ]),
    BusinessesModule,
    OnboardingsModule,
  ],
  controllers: [OnboardingProgressesController],
  providers: [OnboardingProgressesService],
})
export class OnboardingProgressesModule {}
