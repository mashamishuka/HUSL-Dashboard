import * as moment from 'moment';
import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ConnectionsDocument = Connection & Document;

@Schema()
export class Connection {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;

  @Prop({ type: String, enum: ['ringcentral'] })
  appName: 'ringcentral';

  @Prop({ type: String })
  token: string;

  @Prop({ type: String })
  refreshToken: string;

  @Prop({ type: Number })
  expiresIn: number;

  @Prop({ type: Number })
  refreshTokenExpiresIn: number;

  @Prop({ type: Number })
  grantedAt: number;

  @Prop({ type: Number, default: moment().unix() })
  createdAt: number;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);
