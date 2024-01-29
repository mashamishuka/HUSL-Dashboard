import { Document, SchemaTypes } from 'mongoose';
import { Niche } from 'src/niches/niches.schema';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  websiteKey: string;

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'niche' })
  usedByNiches: string[] & Niche[];

  @Prop({ required: true })
  shortAdCopy: string;

  @Prop({ required: true })
  longAdCopy: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: string & User;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
