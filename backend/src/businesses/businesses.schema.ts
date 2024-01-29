import { Document, SchemaTypes } from 'mongoose';
import { File } from 'src/files/files.schema';
import { Finance } from 'src/finances/finances.schema';
import { Niche } from 'src/niches/niches.schema';
import { Product } from 'src/products/products.schema';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BusinessDocument = Business & Document;

@Schema()
export class Business {
  @Prop({ required: true })
  name: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: File.name })
  logo: File;

  @Prop({ type: SchemaTypes.ObjectId, ref: File.name })
  favicon: File;

  @Prop()
  primaryColor: string;

  @Prop()
  secondaryColor: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Product.name })
  product: Product;

  @Prop({ type: SchemaTypes.ObjectId, ref: Niche.name })
  niche: Niche;

  @Prop()
  domain: string;

  @Prop({ type: 'object' })
  accounts: {
    email: {
      email: string;
      password: string;
      nftId?: string;
    };
  };

  @Prop({ default: false })
  generated?: boolean;

  @Prop({ default: false })
  onboardingCompleted?: boolean;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: File.name }] })
  generatedGraphics?: File[];

  @Prop({ type: Object })
  customFields: Record<string, any>;

  @Prop({ default: false })
  deleted?: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: string & User;

  @Prop({ type: SchemaTypes.ObjectId, ref: Finance.name })
  stripeConfig: string & Finance;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
