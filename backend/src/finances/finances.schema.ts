import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FinancesDocument = Finance & Document;

@Schema()
export class Finance {
  @Prop()
  whitelabelTag: string;

  @Prop({ required: true })
  publishableKey: string;

  @Prop({ required: true })
  secretKey: string;

  @Prop()
  stripeUserId: string;

  @Prop()
  ianConnected: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;

  @Prop({ type: Date })
  updatedAt: string;
}

export const FinanceSchema = SchemaFactory.createForClass(Finance);
