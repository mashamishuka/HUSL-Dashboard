import { Injectable } from '@nestjs/common';
import {
  getStripeConnectedAccounts,
  getStripeInvoices,
  getStripeSubscription,
} from '../../helpers/stripeAPI';
import { InjectModel } from '@nestjs/mongoose';
import { StripeMeta } from './stripe-meta.schema';
import { Model } from 'mongoose';
import moment from 'helpers/moment';

@Injectable()
export class StripeMetaService {
  private defaultConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  };
  constructor(
    @InjectModel(StripeMeta.name)
    private stripeMetaModel: Model<StripeMeta>,
  ) {}

  async getConnectedAccounts() {
    const config = this.defaultConfig;
    const accounts = await getStripeConnectedAccounts(config);
    // map account to save in db
    const filteredAccounts = accounts.map((account) => ({
      stripeAccountId: account.id,
      businessProfile: account.business_profile,
      emailHandler: account.email,
    }));
    // save accounts in db but with no duplicate stripeAccountId
    await this.stripeMetaModel.bulkWrite(
      filteredAccounts.map((account) => ({
        updateOne: {
          filter: { stripeAccountId: account.stripeAccountId },
          update: account,
          upsert: true,
        },
      })),
    );
    const stripeMetas = await this.stripeMetaModel.find();

    return stripeMetas;
  }

  // Update all stripe data
  // including invoices, customers, etc.
  async updateStripeData(accId: string) {
    try {
      const config = {
        ...this.defaultConfig,
        stripeUserId: accId,
        isConnected: true,
      };
      const args = {
        useAccount: true,
        unixMin: 0,
        unixMax: moment().unix(),
      };
      // if it was master account, then remove stripeUserId, useAccount
      if (accId === 'MASTER') {
        delete config.stripeUserId;
        delete config.isConnected;
        delete args.useAccount;
      }

      const invoices = await getStripeInvoices(config, args);
      const subscriptions = await getStripeSubscription(config, args);
      return { invoices, subscriptions };
    } catch (error) {
      throw new Error(error);
    }
  }
}
