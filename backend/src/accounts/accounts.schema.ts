import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AccountsDocument = Account & Document;

@Schema()
export class Account {
  @Prop({ required: true })
  websiteKey: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: User;

  @Prop({ required: true, default: false })
  social: boolean;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: false })
  trashed: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
