import { Document, SchemaTypes } from 'mongoose';
import { Business } from 'src/businesses/businesses.schema';
import { Onboarding } from 'src/onboardings/onboardings.schema';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type OnboardingProgressDocument = OnboardingProgress & Document;

@Schema()
export class OnboardingProgress {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;

  @Prop({ type: SchemaTypes.ObjectId, ref: Business.name })
  business: string & Business;

  @Prop({ type: SchemaTypes.ObjectId, ref: Onboarding.name })
  onboarding: string & Onboarding;

  @Prop({ type: String, enum: ['pending', 'completed', 'skiped'] })
  status: 'pending' | 'completed' | 'skiped';
}

export const OnboardingProgressSchema =
  SchemaFactory.createForClass(OnboardingProgress);
