import { Document, SchemaTypes, Types } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type WalletDocument = Wallet & Document;

@Schema()
export class Wallet {
  _id: Types.ObjectId;

  @Prop()
  connector: string;

  @Prop()
  address: string;

  @Prop()
  nftId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'users' })
  user: string & User;

  @Prop()
  nonce: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
