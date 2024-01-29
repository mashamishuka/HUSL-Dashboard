import { Document, SchemaTypes, Types } from 'mongoose';
import { Business } from 'src/businesses/businesses.schema';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SocialAccountsDocument = SocialAccount & Document;

@Schema()
export class SocialAccount {
  _id: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: User;

  @Prop({ type: SchemaTypes.ObjectId, ref: Business.name })
  business?: Business;

  @Prop({ enum: ['fb', 'ig', 'twitter', 'tiktok'] })
  social: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: false })
  trashed: boolean;
}

export const SocialAccountSchema = SchemaFactory.createForClass(SocialAccount);
