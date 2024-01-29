import { Document, SchemaTypes } from 'mongoose';
import { Business } from 'src/businesses/businesses.schema';
import { Niche } from 'src/niches/niches.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LeadsDocument = Leads & Document;

@Schema()
export class Leads {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  // create status enum
  @Prop({
    required: true,
    enum: ['new', 'contacted', 'warm', 'not-interested', 'mia', 'sold'],
    default: 'new',
  })
  status: 'new' | 'contacted' | 'warm' | 'not-interested' | 'mia' | 'sold';

  @Prop({ type: SchemaTypes.ObjectId, ref: Niche.name, required: true })
  niche: Niche;

  @Prop({ type: SchemaTypes.ObjectId, ref: Business.name, required: true })
  business: Business;

  @Prop({ type: SchemaTypes.Mixed })
  notes: {
    content: string;
    createdAt: Date;
  }[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const LeadsSchema = SchemaFactory.createForClass(Leads);
