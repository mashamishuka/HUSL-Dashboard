import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CoursesDocument = Course & Document;

@Schema()
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ type: SchemaTypes.Mixed })
  chapters?: {
    _id: string;
    title: string;
    topics?: {
      _id: string;
      title: string;
      content: string;
      video: string;
      attachment: string;
      reward: number;
      completion_time: string;
    }[];
  }[];

  @Prop({ type: Boolean, default: false })
  published: boolean;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: string & User;

  @Prop({ type: SchemaTypes.Date, default: new Date().getTime() })
  createdAt: string | Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
