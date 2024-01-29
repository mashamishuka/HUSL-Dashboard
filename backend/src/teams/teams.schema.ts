import * as moment from 'moment';
import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TeamsDocument = Team & Document;

@Schema()
export class Team {
  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'User' })
  owner: User;

  @Prop({
    required: true,
    type: [{ type: SchemaTypes.ObjectId, ref: 'User' }],
  })
  members: User[];

  @Prop()
  logs: string[];

  @Prop({ default: moment().unix() })
  createdAt: number;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
