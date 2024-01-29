import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StripeCustomersDocument = StripeCustomer & Document;

@Schema()
export class StripeCustomer {
  _id: Types.ObjectId;

  @Prop({ required: true })
  tag: string;

  @Prop({ type: 'array' })
  data: {
    customerId: string;
    name?: string;
    email?: string;
    phone?: string;
    shipping?: string;
    taxExempt?: string;
    taxIds: string[];
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: number;
      state?: string;
    };
    created?: Date | string;
  }[];
}

export const StripeCustomerSchema =
  SchemaFactory.createForClass(StripeCustomer);
