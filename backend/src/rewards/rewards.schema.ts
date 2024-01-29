import moment from 'helpers/moment';
import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RewardsDocument = Rewards & Document;

@Schema()
export class Rewards {
  // slugified name
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  reference: string;

  @Prop()
  description: string;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: User.name }] })
  claimableBy: string[];

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: User.name }] })
  claimedBy: string[];

  @Prop()
  logs: {
    createdAt: number;
    desc: string;
    user: User | string;
    type: 'claimed' | 'no_permission' | 'failed';
  }[];

  @Prop({ required: true, default: moment().unix() })
  createdAt: number;
}

export const RewardsSchema = SchemaFactory.createForClass(Rewards);
