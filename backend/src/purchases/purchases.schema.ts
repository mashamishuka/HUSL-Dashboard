import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

@Schema()
export class Purchase {
  @Prop({})
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  user: string;

  @Prop({ required: true })
  price: number;

  @Prop({})
  state: string;

  @Prop({ required: true })
  is_stripe_not_usdh: boolean;

  @Prop({ type: {} })
  payment_intent: { id: string };

  @Prop({ type: {} })
  subscription_id: { id: string };

  @Prop({ type: {} })
  subscription_session: { id: string };

  @Prop({})
  tx_hash: string;

  @Prop({ type: {} })
  data: { quantity?: number; stripe_price?: string; repitition?: string };

  @Prop({})
  created: number;

  @Prop({})
  note: string;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
