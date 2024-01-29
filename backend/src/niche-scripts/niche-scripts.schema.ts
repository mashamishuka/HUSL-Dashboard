import { Document, SchemaTypes } from 'mongoose';
import { Niche } from 'src/niches/niches.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type NicheScriptDocument = NicheScript & Document;

@Schema()
export class NicheScript {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  content: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: Niche.name, required: true })
  niche: Niche;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const NicheScriptSchema = SchemaFactory.createForClass(NicheScript);
