import * as moment from 'moment';
import { Document, SchemaTypes } from 'mongoose';
import { File } from 'src/files/files.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type OnboardingDocument = Onboarding & Document;

@Schema()
export class Onboarding {
  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: File.name })
  videoAttachment?: File;

  // create an enum value, with the following values: 'social-access'
  // 'social-access' is the default value
  @Prop({ type: SchemaTypes.String, enum: ['social-access', 'brand-overview'] })
  mapFields: 'social-access' | 'brand-overview';

  @Prop({ type: SchemaTypes.String, enum: ['brand-overview', 'pricing'] })
  renderFeature: 'brand-overview' | 'pricing';

  @Prop({ required: true })
  actions: {
    text: string;
    theme: string;
    type: string;
    url?: string;
  }[];

  @Prop({ type: SchemaTypes.Number, default: 999 })
  order: number;

  @Prop({ type: SchemaTypes.Date, default: moment().unix() })
  createdAt: string | Date;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  deleted: number;
}

export const OnboardingSchema = SchemaFactory.createForClass(Onboarding);
