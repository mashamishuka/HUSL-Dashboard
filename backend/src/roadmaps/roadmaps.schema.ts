import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RoadmapDocument = Roadmap & Document;

@Schema()
export class Roadmap {
  @Prop({ required: true })
  roadmaps: {
    title: string;
    items: string[];
  }[];

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;
}

export const RoadmapSchema = SchemaFactory.createForClass(Roadmap);
