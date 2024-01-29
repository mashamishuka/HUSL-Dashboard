import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GAnalyticDocument = GAnalytic & Document;

@Schema()
export class GAnalytic {
  @Prop({ required: true })
  viewId: string;

  @Prop({ required: true })
  clientId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;
}

export const GAnalyticSchema = SchemaFactory.createForClass(GAnalytic);
