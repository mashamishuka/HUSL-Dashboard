import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Wallet, WalletDocument } from './wallets.schema';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
  ) {}
  async createWallet(address: string, signature: string): Promise<Wallet> {
    return this.walletModel.create({
      address,
      signature,
      nonce: Math.floor(Math.random() * 1000000),
    });
  }

  async nonce(address: string): Promise<Wallet> {
    return this.walletModel.findOneAndUpdate(
      { address },
      { nonce: Math.floor(Math.random() * 1000000) },
      { new: true },
    );
  }

  async getWallet(query: object): Promise<Wallet> {
    return this.walletModel
      .findOne(query)
      .populate('user', [
        'websiteKey',
        'name',
        'email',
        'role',
        'company',
        'profilePicture',
        'nftId',
      ]);
  }
}
