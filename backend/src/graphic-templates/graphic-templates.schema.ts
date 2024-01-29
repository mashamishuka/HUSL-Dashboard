import { Document, SchemaTypes } from 'mongoose';
import { File } from 'src/files/files.schema';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GraphicTemplatesDocument = GraphicTemplate & Document;

@Schema()
export class GraphicTemplate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: File.name, required: true })
  scene: File;

  @Prop({ type: SchemaTypes.ObjectId, ref: File.name, required: true })
  preview: File;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: string & User;

  @Prop({ type: SchemaTypes.Date, default: new Date().getTime() })
  createdAt: string | Date;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  trashed: boolean;
}

export const GraphicTemplateSchema =
  SchemaFactory.createForClass(GraphicTemplate);
