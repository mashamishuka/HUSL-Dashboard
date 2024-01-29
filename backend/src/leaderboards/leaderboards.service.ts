import api from 'helpers/api';
import moment from 'helpers/moment';
import { Model } from 'mongoose';
import { Business } from 'src/businesses/businesses.schema';
import { BusinessesService } from 'src/businesses/businesses.service';
import { FinancesService } from 'src/finances/finances.service';
import { LeadsService } from 'src/leads/leads.service';
import { UsersService } from 'src/users/users.service';
import {
  getStripeInvoices,
  getStripeSubscription,
  getStripeConnectedAccounts,
} from '../../helpers/stripeAPI';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';
import { Leaderboard } from './leaderboards.schema';
import { filterSubscriptionByMetadata } from 'helpers/stripe';

@Injectable()
export class LeaderboardsService {
  private secretKey: string;
  private UNIX_YEAR_START: number;
  private UNIX_NOW: number;
  private INSTANTAPP_ROOT_USER_EMAIL;
  private INSTANTAPP_ROOT_USER_PASSWORD;
  private defaultConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  };

  constructor(
    @InjectModel(Leaderboard.name) private leaderboardModel: Model<Leaderboard>,
    private financeService: FinancesService,
    private businessService: BusinessesService,
    private userService: UsersService,
    private leadsService: LeadsService,
  ) {
    this.secretKey = process.env.STRIPE_SECRET_KEY;
    this.UNIX_NOW = moment().unix();
    this.UNIX_YEAR_START = moment().subtract(5, 'years').startOf('year').unix();
    this.INSTANTAPP_ROOT_USER_EMAIL = process.env.IAN_ROOT_EMAIL;
    this.INSTANTAPP_ROOT_USER_PASSWORD = process.env.IAN_ROOT_PASS;
  }

  async instantappRootLogin() {
    try {
      const login = await api
        .post('https://instantappnow.herokuapp.com/rest/login', {
          email: this.INSTANTAPP_ROOT_USER_EMAIL,
          password: this.INSTANTAPP_ROOT_USER_PASSWORD,
        })
        .then(({ data }) => data);
      return login;
    } catch (error) {
      throw new Error(error);
    }
  }

  getInstantappCompanyDomain(domain?: string) {
    if (!domain) return null;
    const domainWithoutHttps = domain.replace('https://', '');
    const domainWithoutLastSlash = domainWithoutHttps.replace(/\/$/, '');
    return domainWithoutLastSlash;
  }

  /**
   * TODO fix rank and changes feature
   * @returns
   */
  async triggerRevenueUpdate() {
    try {
      // get this period, if it's exist. return it
      // const period = new Date().toISOString().split('T')[0];
      const existingLeaderboard = await this.leaderboardModel
        .find({
          period: {
            $gte: moment().startOf('day'),
            $lte: moment().endOf('day'),
          },
        })
        .populate({
          path: 'business',
          model: Business.name,
          populate: ['logo', 'stripeConfig'],
        })
        .populate({
          path: 'user',
          model: 'User',
          populate: ['profilePicture'],
        });
      if (existingLeaderboard.length) return existingLeaderboard;

      let users: any = await this.userService.findAll({
        deleted: false,
      });
      const stripeConfig = await this.financeService.findAll();
      // filter users by stripe config whitelabel tag
      users = users
        .filter((item) =>
          stripeConfig.find(
            (config) =>
              (config.user as any)?._id?.toString() === item._id?.toString(),
          ),
        )
        ?.map((item) => ({
          id: item._id,
          name: item.name,
          type: 'user',
          logo: item.profilePicture,
          whitelabelTag: stripeConfig.find(
            (config) =>
              (config.user as any)?._id?.toString() === item._id?.toString(),
          )?.whitelabelTag,
          productUrl: this.getInstantappCompanyDomain(item?.productUrl),
        }));
      // merge users and business
      const companies = users;
      const accounts = await getStripeConnectedAccounts(this.defaultConfig);
      const invoices = await getStripeInvoices(
        {
          ...this.defaultConfig,
        },
        {
          unixMin: 0,
          unixMax: this.UNIX_NOW,
        },
      );
      const subscription = await getStripeSubscription(
        {
          ...this.defaultConfig,
        },
        {
          unixMin: 0,
          unixMax: this.UNIX_NOW,
        },
      );
      // get invoices and subscription by stripe account id
      for await (const account of accounts) {
        const config = {
          ...this.defaultConfig,
          stripeUserId: account.id,
          isConnected: true,
        };
        const args = {
          useAccount: true,
          unixMin: 0,
          unixMax: this.UNIX_NOW,
        };
        const invoice = await getStripeInvoices(config, args);
        const sub = await getStripeSubscription(config, args);
        invoices.push(...invoice);
        subscription.push(...sub);
      }
      // login to instantapp and get its token
      const instantappToken = await this.instantappRootLogin().then(
        (data) => data?.token,
      );
      // get invoices by business builderName
      let formattedInvoices = invoices.map(
        ({ lines, created, amount_paid }) => ({
          builderName: lines?.data[0]?.metadata.builderName,
          created: created,
          revenue: amount_paid,
        }),
      );

      // merge formatted invoices array by builderName and count revenue
      formattedInvoices = formattedInvoices.reduce((acc: any, curr) => {
        if (!curr.builderName) return acc;
        const existing = acc.find(
          (item) => item.builderName === curr.builderName,
        );
        if (existing) {
          const customers = filterSubscriptionByMetadata(
            subscription,
            curr?.builderName,
          );
          existing.revenue += curr.revenue;
          existing.created = curr.created;
          existing.activeCustomers = customers.length;
          // existing.customer = customers;
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);

      // merge invoice into business with builderName
      const businessInvoices = companies
        .map((item) => {
          const existing: any = formattedInvoices.find(
            (invoice) => invoice.builderName === item?.whitelabelTag,
          );
          if (existing) {
            if (item.type === 'user') {
              existing.user = item;
            }
            if (item.type === 'business') {
              existing.business = item;
            }
          }

          return existing;
        })
        .filter(Boolean);

      const data = await this.leaderboardModel.find({
        period: {
          $gte: moment().subtract(1, 'days').startOf('day'),
          $lte: moment().subtract(1, 'days').endOf('day'),
        },
      });
      // get highest revenue and order it by revenue
      const leaderboardRevenue = businessInvoices.sort(
        (a, b) => b.revenue - a.revenue,
      );
      // compare with leaderboard data, get ranking difference
      let leaderboardDataWithRankAndDiff = [];
      let rank = 0;
      for await (const v of leaderboardRevenue) {
        rank++;
        // check if leaderboard data already exist
        const checkExist = leaderboardDataWithRankAndDiff.find(
          (item) =>
            item.business?.id?.toString() === v.business?.id?.toString() &&
            item.user?.id?.toString() === v.user?.id?.toString(),
        );
        if (checkExist) continue;
        const existing = data.find((item) =>
          v.type == 'user'
            ? (item.user as any)?._id?.toString() === v.user?.id?.toString()
            : (item.business as any)?._id?.toString() ===
              v.business?.id?.toString(),
        );
        /**
         * INFLUENCE
         */
        // get company leads, fetched from instantapp
        const leadsCount = await api
          .get(
            `https://instantappnow.herokuapp.com/rest/users?take=0&companyDomain=${v?.user?.productUrl}`,
            {
              headers: {
                Authorization: `Bearer ${instantappToken}`,
              },
            },
          )
          .then(({ data }) => data?.count);
        // get leads from husl db, then sum it with instantapp leads
        const leads = await this.leadsService.countTotalData({
          where: {
            business: v.business?.id,
          },
        });

        if (existing) {
          let revenueRankType: 'up' | 'down' | 'equal' = 'equal';
          if (existing.rank?.revenue?.value > rank) {
            revenueRankType = 'up';
          }
          if (existing.rank?.revenue?.value < rank) {
            revenueRankType = 'down';
          }
          v.changes = {
            revenue: {
              value: existing.rank?.revenue?.value - rank,
              type: revenueRankType,
            },
          };
        } else {
          v.changes = {
            revenue: {
              value: 0,
              type: 'equal',
            },
          };
        }
        v.leads = leadsCount + Number(leads);
        leaderboardDataWithRankAndDiff.push(v);
      }
      leaderboardDataWithRankAndDiff = leaderboardDataWithRankAndDiff.map(
        (v, i) => ({
          ...v,
          rank: {
            revenue: {
              value: i,
              type: 'equal',
            },
          },
        }),
      );
      const leaderboardData = leaderboardDataWithRankAndDiff.map((v) => ({
        ...v,
        rank: {
          ...v.rank,
        },
        // TODO FIX change
        changes: {
          ...v.changes,
        },
      }));
      // update leaderboard data
      const dataToUpdate = leaderboardData?.map((v) => ({
        business: v?.business?.id || null,
        user: v?.user?.id || null,
        rank: v.rank,
        changes: v.changes,
        revenue: v.revenue,
        leads: v.leads,
        activeCustomers: v.activeCustomers,
      }));
      await this.leaderboardModel.insertMany(dataToUpdate);
      return leaderboardData;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const page = Number(query?.page) || 0;
      const limit = Number(query?.limit) || 0;
      // get this period, if it's exist. return it
      const existingLeaderboard = await this.leaderboardModel
        .find({
          period: {
            $gte: moment().startOf('day'),
            $lte: moment().endOf('day'),
          },
          ...query,
        })
        .populate({
          path: 'business',
          model: Business.name,
          populate: ['logo', 'stripeConfig'],
        })
        .populate({
          path: 'user',
          model: 'User',
          populate: ['profilePicture'],
        })
        .skip(((page || 0) - 1) * (limit || 0))
        .limit(limit || 0)
        .sort(
          query?.sort || {
            revenue: -1,
          },
        );
      let leaderboards = [...existingLeaderboard, ...existingLeaderboard];
      if (leaderboards.length > 0) {
        // remove same business in leaderboards
        leaderboards = leaderboards.filter(
          (v, i, a) => a.findIndex((t) => t.user.name === v.user.name) === i,
        );

        return leaderboards;
      }
      // create new leaderboard
      const leaderboard = await this.triggerRevenueUpdate();
      return leaderboard;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getLeaderboardGrossGeneratedRevenue(query?: Record<string, any>) {
    try {
      // gross generated revenue is sum of all revenue
      // get only today leaderboard
      const leaderboard = await this.leaderboardModel.find({
        period: {
          $gte: moment().startOf('day'),
          $lte: moment().endOf('day'),
        },
        ...query,
      });
      if (leaderboard.length === 0) {
        await this.triggerRevenueUpdate();
      }
      const grossGeneratedRevenue = leaderboard.reduce(
        (acc, curr) => acc + curr.revenue,
        0,
      );
      return grossGeneratedRevenue;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getLeaderboardHighestGrossGeneratedRevenue(
    query?: Record<string, any>,
  ) {
    try {
      // find today highest revenue on leaderboard
      const leaderboard = await this.leaderboardModel
        .find({
          period: {
            $gte: moment().startOf('day'),
            $lte: moment().endOf('day'),
          },
          ...query,
        })
        .populate('user')
        .sort({ revenue: -1 })
        .limit(1);
      return leaderboard?.[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserFollowers(userId: string) {
    try {
      // const twitter = accounts.find((item) => item.social === 'tw');
      // get instagram followers
      const leaderboard = await this.leaderboardModel.find({
        period: {
          $gte: moment().startOf('day'),
          $lte: moment().endOf('day'),
        },
        user: userId,
      });
      if (leaderboard.length === 0) {
        await this.triggerRevenueUpdate();
      }
      await this.triggerRevenueUpdate();

      const followers = leaderboard?.pop()?.influence || 0;
      return followers;
    } catch (error) {
      throw new Error(error);
    }
  }

  async countTotalData(query?: Record<string, any>) {
    try {
      const period = new Date().toISOString().split('T')[0];
      const totalData = await this.leaderboardModel.countDocuments({
        period: {
          $gte: moment(period).startOf('day'),
          $lte: moment(period).endOf('day'),
        },
        ...query,
      });
      return totalData;
    } catch (error) {
      throw new Error(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} leaderboard`;
  }

  update(id: number) {
    return `This action updates a #${id} leaderboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} leaderboard`;
  }
}
