import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
export type SettingDocument = Setting & Document;

@Schema()
export class Setting {
  @Prop({ required: true })
  key: string;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  value: any;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
