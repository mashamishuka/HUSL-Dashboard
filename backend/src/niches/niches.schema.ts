import { Document, SchemaTypes } from 'mongoose';
import { File } from 'src/files/files.schema';
import { Product } from 'src/products/products.schema';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type NicheDocument = Niche & Document;

@Schema()
export class Niche {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  tagCopy: {
    key: string;
    value: string;
  }[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: Product.name })
  products: string[] & Product[];

  @Prop()
  suggestedHastags: string[];

  @Prop()
  productMockups: {
    productId: Product;
    mobileMockups: File[];
    desktopMockups: File[];
    mockups: File[];
  }[];

  @Prop({ type: Object })
  customFields: Record<string, any>;

  // deleted
  @Prop({ default: false })
  deleted: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: string & User;
}

export const NicheSchema = SchemaFactory.createForClass(Niche);
