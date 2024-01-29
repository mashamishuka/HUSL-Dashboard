import { User } from 'facebook-nodejs-business-sdk';
import { Document, SchemaTypes } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FilesDocument = File & Document;

@Schema()
export class File {
  @Prop({ required: true })
  bucket: string;

  @Prop({ required: true })
  public url: string;

  @Prop()
  public key: string;

  @Prop()
  ETag: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
