import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type APIDocument = API & Document;

@Schema()
export class API {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true, enum: ['lifetime', 'temp'] })
  type: 'lifetime' | 'temp';

  @Prop({ type: 'date' })
  expiresAt: string;

  @Prop({ type: 'date', required: true })
  createdAt: Date | string;
}

export const APISchema = SchemaFactory.createForClass(API);
