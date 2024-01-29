import * as moment from 'moment';
import { Document, SchemaTypes } from 'mongoose';
import { Rewards } from 'src/rewards/rewards.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GoalTrackerDocument = GoalTracker & Document;

@Schema()
export class GoalTracker {
  @Prop({ type: SchemaTypes.Mixed })
  achieved: {
    sales: number;
    calls: number;
  };

  @Prop({ type: SchemaTypes.Mixed })
  goals: {
    sales: number;
    calls: number;
  };

  @Prop({ type: String, enum: ['earn', 'bet'] })
  type: 'earn' | 'bet';

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user: string;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isUserReset: boolean;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  isRewardClaimed: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: Rewards.name })
  reward: string;

  @Prop({ type: Number, default: moment().unix() })
  createdAt: number;

  // default to next 12 hours
  @Prop({ type: Number, default: moment().add(12, 'hours').unix() })
  expiresAt: number;
}

export const GoalTrackerSchema = SchemaFactory.createForClass(GoalTracker);
