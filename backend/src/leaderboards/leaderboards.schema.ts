import { Document, SchemaTypes } from 'mongoose';
import { Business } from 'src/businesses/businesses.schema';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LeaderboardDocument = Leaderboard & Document;

@Schema()
export class Leaderboard {
  @Prop({ type: SchemaTypes.ObjectId, ref: Business.name })
  business: string & Business;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user: string & User;

  @Prop({ type: Number })
  revenue?: number;

  @Prop({ type: Number })
  influence?: number;

  @Prop({ type: Number })
  leads?: number;

  @Prop({ type: Number })
  activeCustomers?: number;

  @Prop({ type: Object })
  rank: {
    revenue: {
      type: 'up' | 'down' | 'equal';
      value: number;
    };
    influence: {
      type: 'up' | 'down' | 'equal';
      value: number;
    };
  };

  @Prop({ type: Object })
  changes: {
    revenue: {
      type: 'up' | 'down' | 'equal';
      value: number;
    };
    influence: {
      type: 'up' | 'down' | 'equal';
      value: number;
    };
  };

  @Prop({ type: Date, default: new Date().toISOString() })
  period: string | Date;

  @Prop({ type: Date, default: new Date().toISOString() })
  generatedAt: string | Date;
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard);
