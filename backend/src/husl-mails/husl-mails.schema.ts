import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type HuslMailDocument = HuslMail & Document;

@Schema()
export class HuslMail {
  @Prop({ required: true })
  token: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;
}

export const HuslMailSchema = SchemaFactory.createForClass(HuslMail);
