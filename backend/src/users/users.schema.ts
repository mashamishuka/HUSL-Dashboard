import { Document, SchemaTypes } from 'mongoose';
import { Account } from 'src/accounts/accounts.schema';
import { Business } from 'src/businesses/businesses.schema';
import { File } from 'src/files/files.schema';
import { Team } from 'src/teams/teams.schema';
import { Wallet } from 'src/wallets/wallets.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UsersDocument = User & Document;

@Schema()
export class User {
  @Prop()
  websiteKey: string;

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  company: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: File.name })
  profilePicture: string;

  @Prop()
  nftId: string;

  @Prop({})
  foundersCard: string;

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Account' })
  accounts: Account[];

  @Prop({ type: SchemaTypes.ObjectId, ref: Wallet.name })
  wallet: string;

  @Prop({ default: false })
  addLater: boolean;

  @Prop({ enum: ['admin', 'user', 'member'], default: 'user' })
  role: 'admin' | 'user' | 'member';

  @Prop({ type: SchemaTypes.ObjectId, ref: Team.name })
  team: Team;

  @Prop()
  password: string;

  @Prop()
  productUrl: string;

  @Prop()
  discordUsername: string;

  @Prop()
  socialConnectorEmail: string;

  @Prop()
  socialConnectorAddress: string;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Business' }] })
  business: Business[];

  @Prop({ default: false })
  deleted: boolean;

  @Prop()
  permissions: string[];

  @Prop()
  lastLogin: number;

  @Prop()
  verifiedAt: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
