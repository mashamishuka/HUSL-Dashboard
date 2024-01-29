import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FbAdsDocument = FbAds & Document;

@Schema()
export class FbAds {
  @Prop({ required: true })
  adAccountId: string;

  @Prop({ required: true })
  token: string;

  @Prop()
  hasToken: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;
}

export const FbAdsSchema = SchemaFactory.createForClass(FbAds);
