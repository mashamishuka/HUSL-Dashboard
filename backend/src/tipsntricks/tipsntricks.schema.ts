import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TipsNTrickDocument = TipsNTrick & Document;

@Schema()
export class TipsNTrick {
  @Prop({ required: true })
  tipsNtricks: {
    title: string;
    description: string;
  }[];

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;
}

export const TipsNTrickSchema = SchemaFactory.createForClass(TipsNTrick);
