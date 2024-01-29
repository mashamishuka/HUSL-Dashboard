import api from 'helpers/api';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as stripeApi from '../../helpers/stripeAPI';
import { CreateRewardDto } from './dto/create-reward.dto';
import { Rewards } from './rewards.schema';

@Injectable()
export class RewardsService {
  zapUrl: string;
  constructor(
    @InjectModel(Rewards.name) private rewardModel: Model<Rewards>,
    private userService: UsersService,
  ) {
    this.zapUrl = process.env.ZAP_WEBHOOK_REWARD_URL;
  }

  private async authorize(user: string) {
    const userData = await this.userService.findOne(user);
    if (!userData?.socialConnectorEmail) {
      throw new UnauthorizedException(
        'Add your SocialConnector email if you want to receive $HSL rewards for building your business.',
      );
    }
    return userData;
  }

  /**
   * send a reward through zapier webhook
   * @param user
   * @param name: name of the reward, it's unique
   */
  async sendReward(user: string, name: string) {
    const userData = await this.authorize(user);
    const reward = await this.findRewardByName(name);
    // check if user is allowed to claim reward
    const claimableBy = reward?.claimableBy;
    if (!claimableBy?.includes(user)) {
      // update logs
      reward.logs.push({
        createdAt: Date.now(),
        desc: `User ${user} is not allowed to claim this reward`,
        user,
        type: 'no_permission',
      });
      await reward.save();
      throw new Error('You are not allowed to claim this reward');
    }
    // check if user has already claimed reward
    const claimedBy = reward?.claimedBy;
    if (claimedBy?.includes(user)) {
      // update logs
      reward.logs.push({
        createdAt: Date.now(),
        desc: `User ${user} has already claimed this reward`,
        user,
        type: 'claimed',
      });
      await reward.save();
      throw new Error('You have already claimed this reward');
    }
    const { amount } = reward;
    const data = {
      email: userData?.socialConnectorEmail,
      amount,
    };

    const response = await api.post(this.zapUrl, data);
    // check if response is ok
    if (response?.status !== 200) {
      // update logs
      reward.logs.push({
        createdAt: Date.now(),
        desc: `Failed to send reward to user ${user}`,
        user,
        type: 'failed',
      });
      // we need to also remove the user from claimedBy
      const claimedBy = reward?.claimedBy;
      const index = claimedBy?.indexOf(user);
      if (index > -1) {
        claimedBy?.splice(index, 1);
      }
      // update claimedBy and reward
      reward.claimedBy = claimedBy;
      await reward.save();
      return reward;
    }
    // update logs
    reward.logs.push({
      createdAt: Date.now(),
      desc: `User ${user} has claimed this reward`,
      user,
      type: 'claimed',
    });
    // update claimedBy and reward, make sure there is no duplicate user
    const claimed = reward?.claimedBy;
    if (!claimedBy?.includes(user)) {
      claimed?.push(user);
    }
    reward.claimedBy = claimed;

    await reward.save();
    return reward;
  }

  async create(createRewardDto: CreateRewardDto) {
    try {
      const reward = new this.rewardModel(createRewardDto);
      // split claimableBy into array of user ids
      const claimableBy = createRewardDto?.claimableBy?.split(',');
      // add claimableBy to reward
      reward.claimableBy = claimableBy;
      await reward.save();
      return reward;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const rewards = await this.rewardModel.find(query).exec();
      // we need to change the description, if there is any [amount] in the description
      const obj = rewards.map((reward) => {
        let description = reward?.description;
        const amount = reward?.amount;
        // we might add another variable to the description, so we need to use regex
        description = description?.replace(/\[(.*?)\]/g, (match, p1) => {
          if (p1 === 'amount') return amount?.toString();
          return match;
        });

        return {
          ...reward?.toJSON(),
          description,
        };
      });

      return obj;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * get reward by name
   * @param name
   * @returns
   */
  async findRewardByName(name: string) {
    try {
      const reward = await this.rewardModel.findOne({ name });
      // we need to change the description, if there is any [amount] in the description
      let description = reward?.description;
      const amount = reward?.amount;
      // we might add another variable to the description, so we need to use regex
      description = description?.replace(/\[(.*?)\]/g, (match, p1) => {
        if (p1 === 'amount') return amount?.toString();
        return match;
      });
      reward.description = description;
      return reward;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * get reward by ID
   * @param ID
   * @returns
   */
  async findRewardById(userId: string, _id: string) {
    // check if user is allowed to claim reward
    const reward = await this.rewardModel.findOne({
      _id,
      claimableBy: userId,
    });
    // we need to change the description, if there is any [amount] in the description
    let description = reward?.description;
    const amount = reward?.amount;
    // we might add another variable to the description, so we need to use regex
    description = description?.replace(/\[(.*?)\]/g, (match, p1) => {
      if (p1 === 'amount') return amount?.toString();
      return match;
    });
    reward.description = description;
    return reward;
  }

  /**
   * check if a user is able to claim a reward
   * @param query
   */
  async check(query: Record<string, any>) {
    try {
      const { name, user } = query;
      // get reward by name
      const reward = await this.findRewardByName(name);
      // check if user is allowed to claim reward
      const claimableBy = reward?.claimableBy;
      if (!claimableBy?.includes(user))
        return {
          type: 'no_permission',
          reward,
        };
      // check if user has already claimed reward
      const claimedBy = reward?.claimedBy;
      if (claimedBy?.includes(user))
        return {
          type: 'claimed',
          reward,
        };
      return {
        type: 'ok',
        reward,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getBusinessDetailByInvoice(invoiceId?: string) {
    try {
      const stripe = await stripeApi.stripeConnect();
      const accounts = await stripe.accounts.list().then(({ data }) => data);

      // invoice detail
      const invoice = await stripe.invoices.retrieve(invoiceId);
      // filter account with business profile url
      const account = accounts.find(
        (account) => account.business_profile.url === invoice?.account_name,
      );
      // get user data by business account id
      const user = await this.userService.findOneByQuery({
        stripeUserId: account?.id,
      });
      return { account, user };
    } catch (_) {
      return {
        account: null,
        user: null,
      };
    }
  }

  async stripeWebhook(body: Record<string, any>) {
    const triggerSalesWebhook = async () => {
      const business = await this.getBusinessDetailByInvoice(
        body?.data?.object?.invoice,
      );
      const account = business?.account;
      const user = business?.user;

      const data = {
        name: `sales-${account?.id}-${user?._id}`,
        amount: 20,
        reference: 'sales',
        description: 'You just made a sale, amazing! Here’s 20 $HSL 🎉',
        claimableBy: user?._id,
      };
      await this.create(data);
    };
    try {
      switch (body?.type) {
        case 'payment_intent.succeeded':
          await triggerSalesWebhook();
          break;
        case 'customer.subscription.created':
          await triggerSalesWebhook();
          break;
        default:
          break;
      }
      return body;
    } catch (error) {
      throw new Error(error);
    }
  }
}
