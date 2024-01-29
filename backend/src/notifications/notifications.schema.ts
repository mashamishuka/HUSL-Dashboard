import moment from 'helpers/moment';
import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type NotificationsDocument = Notifications & Document;

@Schema()
export class Notifications {
  // slugified name
  @Prop({ required: true })
  name: string[];

  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop()
  status: boolean;

  @Prop()
  type: string;

  @Prop({ required: true, default: moment().unix() })
  createdAt: number;
}

export const NotificationsSchema = SchemaFactory.createForClass(Notifications);
