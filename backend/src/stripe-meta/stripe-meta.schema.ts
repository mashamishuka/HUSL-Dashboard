import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import moment from 'helpers/moment';
import { Document } from 'mongoose';
import Stripe from 'stripe';

export type StripeMetaDocument = StripeMeta & Document;

@Schema()
export class StripeMeta {
  @Prop({ required: true })
  stripeAccountId: string;

  @Prop({ type: Object })
  businessProfile: Stripe.Account.BusinessProfile;

  @Prop()
  emailHandler: string;

  @Prop({ type: Object })
  data: {
    invoices: {
      data: Stripe.Invoice[];
      lastUpdated: number;
    };
    customers: {
      data: Stripe.Customer[];
      lastUpdated: number;
    };
  };

  @Prop({ required: true, default: moment().unix() })
  lastUpdated: number;
}

export const StripeMetaSchema = SchemaFactory.createForClass(StripeMeta);
