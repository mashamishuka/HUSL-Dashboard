import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PayoutsDocument = Payout & Document;

@Schema()
export class Payout {
  @Prop({ required: true })
  amount_paid: number;

  @Prop({ required: true })
  created: number;

  @Prop({ type: SchemaTypes.Mixed, required: false })
  transaction: any;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;
}

export const PayoutSchema = SchemaFactory.createForClass(Payout);
