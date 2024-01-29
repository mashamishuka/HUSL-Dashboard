import { Document, SchemaTypes } from 'mongoose';
import { Course } from 'src/courses/courses.schema';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CourseParticipantsDocument = CourseParticipant & Document;

@Schema()
export class CourseParticipant {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;

  @Prop({ type: SchemaTypes.ObjectId, ref: Course.name })
  course: string & Course;

  @Prop([{ type: SchemaTypes.ObjectId, ref: Course.name }])
  completed_topics: string[];

  // completion object
  @Prop({ type: SchemaTypes.Array, default: [] })
  completion_data: {
    completion_time: number;
    topic_id: string;
    is_completed: boolean;
    reward?: string;
    reward_claimed?: boolean;
  }[];

  @Prop({ type: SchemaTypes.Array, default: [] })
  completion_meta: {
    video_duration: number;
    video_played_time: number;
    attachment_downloaded: boolean;
    topic_id: string;
  }[];

  @Prop({ type: Boolean, default: false })
  is_completed: boolean;

  @Prop({ type: Number })
  progress: number;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, default: Date.now })
  completed_at: Date;
}

export const CourseParticipantSchema =
  SchemaFactory.createForClass(CourseParticipant);
