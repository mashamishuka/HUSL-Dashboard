import * as CryptoJS from 'crypto-js';
import { User } from 'facebook-nodejs-business-sdk';
import api from 'helpers/api';
import { addHttp } from 'helpers/common';
import * as stripeHelper from 'helpers/stripe';
import { groupBy } from 'lodash';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import Stripe from 'stripe';

import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { forwardRef } from '@nestjs/common/utils';
import { InjectModel } from '@nestjs/mongoose';

import * as stripeApi from '../../helpers/stripeAPI';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { Finance } from './finances.schema';

const UNIX_YEAR_START = moment().startOf('year').unix();
const UNIX_YEAR_END = moment().endOf('year').unix();

const UNIX_LAST_YEAR_START = moment()
  .subtract(1, 'year')
  .startOf('year')
  .unix();
const UNIX_LAST_YEAR_END = moment().subtract(1, 'year').endOf('year').unix();

const UNIX_MONTH_START = moment().startOf('month').unix();
const UNIX_MONTH_END = moment().endOf('month').unix();

const UNIX_LAST_MONTH_START = moment()
  .subtract(1, 'month')
  .startOf('month')
  .unix();
const UNIX_LAST_MONTH_END = moment().subtract(1, 'month').endOf('month').unix();

const UNIX_DAY_START = moment().startOf('day').unix();

const UNIX_NOW = moment().unix();

@Injectable()
export class FinancesService {
  constructor(
    @InjectModel(Finance.name) private financeModel: Model<Finance>,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
  ) {}

  /**
   * This is private method to get the user stripe configuration
   * @param userId
   * @returns
   */
  async getStripeConfig(userId: string) {
    try {
      const stripeConfig = await this.financeModel
        .findOne({
          user: userId,
        })
        .populate('user');
      return {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        tag: stripeConfig?.whitelabelTag || null,
        stripeUserId: stripeConfig?.stripeUserId || null,
        isConnected: stripeConfig?.ianConnected || false,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async instantappRootLogin() {
    try {
      const login = await api
        .post('https://instantappnow.herokuapp.com/rest/login', {
          email: process.env.IAN_ROOT_EMAIL,
          password: process.env.IAN_ROOT_PASS,
        })
        .then(({ data }) => data);
      return login;
    } catch (error) {
      throw new Error(error);
    }
  }

  async verifyStripeOwnership(userId: string) {
    try {
      // login to instantappnow
      const login = await this.instantappRootLogin();
      // get user website
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new Error('User not found.');
      }
      const domain = new URL(addHttp(user?.productUrl));

      // get IAN stripe data
      const stripeConnection = await api
        .get(
          `https://instantappnow.herokuapp.com/rest/stripe/${domain?.host}`,
          {
            headers: {
              Authorization: `Bearer ${login?.token}`,
            },
          },
        )
        .then(({ data }) => data);
      if (stripeConnection) {
        // update to user stripe config
        await this.financeModel.findOneAndUpdate(
          { user: userId },
          {
            stripeUserId: stripeConnection?.stripeAccountId || null,
            ianConnected: stripeConnection?.isConnected,
            updatedAt: moment().valueOf(),
          },
          { new: true },
        );
      }
      return stripeConnection;
    } catch (error) {
      throw new Error(error);
    }
  }
  /**
   * Create stripe config
   * @param createFinanceDto
   * @returns
   */
  async create(createFinanceDto: CreateFinanceDto) {
    try {
      const user = await this.userService.findOne(createFinanceDto.userId);
      if (!user) {
        throw new Error('User not found.');
      }

      // encrypt the access token
      if (createFinanceDto?.secretKey) {
        const keyFormula = `${user?._id}_${createFinanceDto.publishableKey}`;
        createFinanceDto.secretKey = CryptoJS.AES.encrypt(
          createFinanceDto.secretKey,
          keyFormula,
        ).toString();
      }
      const currentFinanceConfig = await this.financeModel.findOne({
        user: user._id,
      });
      // if the user already has a configuration, update it
      if (currentFinanceConfig) {
        return await this.financeModel.findOneAndUpdate(
          { user: user._id },
          createFinanceDto,
          { new: true },
        );
      } else {
        return await this.financeModel.create({
          ...createFinanceDto,
          user: user._id,
        });
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(userId: number) {
    try {
      const stripe = await this.financeModel
        .findOne({
          user: userId,
        })
        .select(['_id', 'stripeUserId', 'user', 'whitelabelTag']);

      return stripe;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get stripe invoices
   * @returns
   */
  async getStripeInvoices(userId) {
    try {
      const config = await this.getStripeConfig(userId);
      if (!config?.secretKey || !config?.publishableKey) {
        throw new Error('Stripe configuration invalid.');
      }
      const stripe = new Stripe(config?.secretKey, {
        apiVersion: null,
      });
      const invoices = await stripe.invoices.list();

      return {
        invoices,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get stripe recurring revenue from invoices
   * @returns
   */
  async getRecurringRevenue(
    userId,
    query?: {
      unix_min?: number;
      unix_max?: number;
    },
  ) {
    try {
      const config = await this.getStripeConfig(userId);
      if (!config?.secretKey || !config?.publishableKey) {
        throw new Error('Stripe configuration invalid.');
      }
      let unix_min = moment().subtract(3, 'years').unix();
      let unix_max = moment().unix();
      if (query?.unix_min && query?.unix_max) {
        unix_min = query?.unix_min;
        unix_max = query?.unix_max;
      }
      const accounts = await stripeApi.getStripeConnectedAccounts({
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      });

      let subscriptions = await stripeApi.getStripeSubscription(config, {
        unixMin: unix_min,
        unixMax: unix_max,
      });
      subscriptions = stripeHelper.filterSubscriptionByProduct(subscriptions);
      // get each account's subscriptions
      for await (const account of accounts) {
        const accountSubscriptions = await stripeApi.getStripeSubscription(
          {
            secretKey: process.env.STRIPE_SECRET_KEY,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            stripeUserId: account?.id,
            isConnected: true,
          },
          {
            unixMin: unix_min,
            unixMax: unix_max,
            useAccount: true,
          },
        );
        subscriptions = subscriptions.concat(accountSubscriptions);
      }

      // get recurring revenue by sum up subscriptions with plan.amount
      const recurringRevenue = subscriptions?.reduce(
        (sum, subscription) =>
          sum + (subscription as Record<string, any>)?.plan?.amount ||
          Number((subscription as Record<string, any>)?.plan?.amount_decimal),
        0,
      );
      // const recurringRevenue = subscriptions?.length * 7400;
      const customers = subscriptions.length;

      return {
        recurringRevenue,
        customers,
        subscriptions,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get stripe recurring revenue from invoices
   * @returns
   */
  async getWeeklySales(userId) {
    try {
      const config = await this.getStripeConfig(userId);
      if (!config?.secretKey || !config?.publishableKey) {
        throw new Error('Stripe configuration invalid.');
      }
      const unix_min = moment().subtract(1, 'weeks').unix();
      const unix_max = moment().unix();

      const subscriptions = await stripeApi.getStripeSubscription(config, {
        unixMin: unix_min,
        unixMax: unix_max,
      });
      const filteredSubscriber =
        stripeHelper.filterSubscriptionByProduct(subscriptions);
      const customers = filteredSubscriber.length;

      return customers;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get revenue report
   * @returns
   */
  async getRevenueReport({ userId, ...query }) {
    try {
      const config = await this.getStripeConfig(userId);
      const whitelabel = config?.tag;
      const reportType = query?.reportType || 'this_week';

      // all balance transactions
      const fetchInvoices = async (isUserAccount = false) => {
        const invoicesObj = await stripeApi.getStripeInvoices(config, {
          unixMin: 0,
          unixMax: UNIX_NOW,
          paid: true,
          useAccount: isUserAccount,
        });

        // today balance transactions
        const todayInvoicesObj = await stripeApi.getStripeInvoices(config, {
          unixMin: UNIX_DAY_START,
          unixMax: UNIX_NOW,
          paid: true,
          useAccount: isUserAccount,
        });
        let filteredTransactions: any[];
        switch (reportType) {
          case 'last_month':
            // last month, get from 1st day of last month to last day of last month in invoices
            filteredTransactions = invoicesObj.filter(
              (invoice) =>
                moment
                  .unix(invoice.created)
                  .isBetween(
                    moment().subtract(1, 'months').startOf('month'),
                    moment().subtract(1, 'months').endOf('month'),
                  ) && invoice.status === 'paid',
            );
            break;
          case 'last_week': {
            // last week, get from 1st day of last week to last day of last week in invoices
            filteredTransactions = invoicesObj.filter(
              (invoice) =>
                moment
                  .unix(invoice.created)
                  .isBetween(
                    moment().subtract(1, 'weeks').startOf('week'),
                    moment().subtract(1, 'weeks').endOf('week'),
                  ) && invoice.status === 'paid',
            );
            break;
          }
          case 'this_month':
            filteredTransactions = await stripeApi.getStripeInvoices(config, {
              unixMin: UNIX_MONTH_START,
              unixMax: UNIX_NOW,
              paid: true,
              useAccount: isUserAccount,
            });
            break;
          case 'this_year':
            filteredTransactions = invoicesObj.filter(
              (invoice) =>
                moment
                  .unix(invoice.created)
                  .isBetween(moment().startOf('year'), moment()) &&
                invoice.status === 'paid',
            );
            break;
          case 'last_year':
            filteredTransactions = invoicesObj.filter(
              (invoice) =>
                moment
                  .unix(invoice.created)
                  .isBetween(
                    moment().subtract(1, 'years').startOf('year'),
                    moment().subtract(1, 'years').endOf('year'),
                  ) && invoice.status === 'paid',
            );
            break;
          default:
            filteredTransactions = invoicesObj.filter(
              (invoice) =>
                moment
                  .unix(invoice.created)
                  .isBetween(
                    moment().subtract(1, 'weeks').startOf('week'),
                    moment().subtract(1, 'weeks').endOf('week'),
                  ) && invoice.status === 'paid',
            );
            break;
        }
        filteredTransactions =
          stripeHelper.formatInvoices(filteredTransactions);
        let todayInvoices = stripeHelper.formatInvoices(todayInvoicesObj);
        let invoices = stripeHelper.formatInvoices(invoicesObj);

        if (whitelabel && !isUserAccount) {
          invoices = invoices.filter(
            ({ builderName }) => builderName === whitelabel,
          );
          filteredTransactions = filteredTransactions.filter(
            ({ builderName }) => builderName === whitelabel,
          );
          todayInvoices = todayInvoices.filter(
            ({ builderName }) => builderName === whitelabel,
          );
        }
        return {
          invoices,
          filteredTransactions,
          todayInvoices,
        };
      };
      let getInvoices = await fetchInvoices();

      // if there user has another account connected to IAN
      if (config?.stripeUserId) {
        const accountInvoices = await fetchInvoices(true);
        getInvoices = {
          invoices: getInvoices.invoices.concat(accountInvoices.invoices),
          filteredTransactions: getInvoices.filteredTransactions.concat(
            accountInvoices.filteredTransactions,
          ),
          todayInvoices: getInvoices.todayInvoices.concat(
            accountInvoices.todayInvoices,
          ),
        };
      }
      const { invoices, filteredTransactions, todayInvoices } = getInvoices;

      let stats;
      let alltimeStats;
      if (reportType == 'this_year' || reportType == 'last_year') {
        const groupedByMonth = groupBy(filteredTransactions, (trx) => {
          return moment.unix(trx?.created).format('M');
        });
        const statData = moment
          .months()
          .map((month, index) => {
            // get this year's month, remove rest of the months
            const thisMonth = moment().month();
            if (index > thisMonth) {
              return null;
            }
            return {
              month,
              monthShort: moment.monthsShort()[index],
              amount: stripeHelper.sumFormattedInvoices(
                groupedByMonth[index + 1],
              ),
            };
          })
          .filter(Boolean);
        const allGroupedByMonth = groupBy(invoices, (trx) => {
          return moment.unix(trx?.created).format('M');
        });
        alltimeStats = moment.months().map((month, index) => {
          return {
            month,
            monthShort: moment.monthsShort()[index],
            amount: stripeHelper.sumFormattedInvoices(
              allGroupedByMonth[index + 1],
            ),
          };
        });
        const label = moment
          .months()
          .map((_, index) => {
            const thisMonth = moment().month();
            if (index > thisMonth) {
              return null;
            }
            return moment.monthsShort()[index];
          })
          .filter(Boolean);
        stats = {
          label,
          data: statData,
        };
      } else if (reportType == 'this_month' || reportType == 'last_month') {
        const groupedByDay = groupBy(filteredTransactions, (trx) => {
          return Number(moment.unix(trx?.created).date());
        });
        const statData = Array.from(Array(moment().daysInMonth()).keys()).map(
          (date, index) => {
            return {
              date: date + 1,
              dayShort: moment()
                .date(date + 1)
                .format('ddd'),
              amount: stripeHelper.sumFormattedInvoices(
                groupedByDay[index + 1],
              ),
            };
          },
        );
        const allGroupedByDay = groupBy(invoices, (trx) => {
          return moment.unix(trx?.created).format('dddd');
        });
        alltimeStats = Array.from(Array(moment().daysInMonth()).keys()).map(
          (date, index) => {
            return {
              date: date + 1,
              dayShort: moment()
                .date(date + 1)
                .format('ddd'),
              amount: stripeHelper.sumFormattedInvoices(
                allGroupedByDay[index + 1],
              ),
            };
          },
        );
        stats = {
          label: Array.from(Array(moment().daysInMonth()).keys()).map(
            (date) => date + 1,
          ),
          data: statData,
        };
      } else if (reportType == 'this_week' || reportType == 'last_week') {
        const groupedByDay = groupBy(filteredTransactions, (trx) => {
          return moment.unix(trx?.created).format('dddd');
        });
        const statData = moment.weekdays().map((day, index) => {
          return {
            day,
            dayShort: moment.weekdaysShort()[index],
            amount: stripeHelper.sumFormattedInvoices(groupedByDay[day]),
          };
        });
        const allGroupedByDay = groupBy(invoices, (trx) => {
          return moment.unix(trx?.created).format('dddd');
        });
        alltimeStats = moment.months().map((day, index) => {
          return {
            day,
            dayShort: moment.weekdaysShort()[index],
            amount: stripeHelper.sumFormattedInvoices(
              allGroupedByDay[index + 1],
            ),
          };
        });
        stats = {
          label: moment
            .weekdays()
            .map((_, index) => moment.weekdaysShort()[index]),
          data: statData,
        };
      }

      return {
        reportDate: moment().valueOf(),
        reportType,
        allTransactions: {
          amount: stripeHelper.sumFormattedInvoices(invoices),
          lastTransactionAt: moment.unix(invoices?.[0]?.created).valueOf(),
          data: invoices,
        },
        transactions: {
          amount: stripeHelper.sumFormattedInvoices(filteredTransactions),
          lastTransactionAt: moment
            .unix(filteredTransactions?.[0]?.created)
            .valueOf(),
          data: filteredTransactions,
        },
        todayTransactions: {
          amount: stripeHelper.sumFormattedInvoices(todayInvoices),
          lastTransactionAt: moment.unix(todayInvoices?.[0]?.created).valueOf(),
          data: todayInvoices,
        },
        alltimeStats,
        stats,
      };
    } catch (error) {
      throw new Error(error);
    }
  }
  /**
   * Get all invoices of all businesses
   * @returns
   */

  async getInvoicesFormatted(
    user_id: string,
    unix_min?: number,
    unix_max?: number,
    useAccount?: boolean,
  ) {
    // get config
    const config = await this.getStripeConfig(user_id);
    const invoices_in_time_period = await stripeApi.getStripeInvoices(config, {
      unixMin: unix_min,
      unixMax: unix_max,
      useAccount,
    });
    const formatted = stripeHelper.formatInvoices(invoices_in_time_period);
    return formatted;
  }

  /**
   * Get all customers of all businesses
   * @returns
   */
  async getWhitelabelTags() {
    try {
      const whitelabelTags = await this.financeModel.find({});

      const whitelabel_by_id: any = {};

      whitelabelTags.forEach(({ user, whitelabelTag }) => {
        whitelabel_by_id[user.toString()] = whitelabelTag;
      });

      return {
        whitelabel_by_id: whitelabel_by_id,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get monthly growth report
   * @returns
   */
  async getMonthlyGrowthReport(userId) {
    try {
      const config = await this.getStripeConfig(userId);

      if (!config?.secretKey || !config?.publishableKey) {
        throw new Error('Stripe configuration invalid.');
      }
      const stripe = new Stripe(config?.secretKey, {
        apiVersion: null,
      });

      // all balance transactions
      let subscriptions = await stripe.subscriptions
        .list({
          created: {
            gte: moment().startOf('year').unix(),
            lte: moment().endOf('year').unix(),
          },
        })
        .then(({ data }) => data);

      if (config?.tag) {
        subscriptions = stripeHelper.filterSubscriptionByMetadata(
          subscriptions,
          config?.tag,
        );
      }

      // group by month
      const groupedByMonth = groupBy(subscriptions, (trx) => {
        return moment.unix(trx?.created).format('M');
      });
      const monthlyGrowthReport = moment.months().map((month, index) => {
        return {
          month,
          monthShort: moment.monthsShort()[index],
          amount:
            stripeHelper.sumTotalInvoiceTrx(groupedByMonth[index + 1]) || 0,
        };
      });

      return {
        reportDate: moment().valueOf(),
        period: moment().format('YYYY'),
        data: monthlyGrowthReport,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get stripe churn rate
   * @returns
   */
  async getStripeChurnRate(userId) {
    try {
      const config = await this.getStripeConfig(userId);
      if (!config?.secretKey || !config?.publishableKey) {
        throw new Error('Stripe configuration invalid.');
      }
      const stripe = new Stripe(config?.secretKey, {
        apiVersion: null,
      });
      // get stripe subscriber churn rate
      let subscribers = await stripeApi.getStripeSubscription(config, {
        unixMin: 0,
        unixMax: UNIX_NOW,
      });
      let subscriptions = subscribers.filter(
        (v) => v.status === 'active' || v.status === 'trialing',
      );
      let canceled = subscribers.filter((v) => v.status === 'canceled');
      // filter subscription items by tag
      if (config?.tag) {
        subscriptions = stripeHelper.filterSubscriptionByMetadata(
          subscriptions,
          config?.tag,
        );
        subscribers = stripeHelper.filterSubscriptionByMetadata(
          subscribers,
          config?.tag,
        );
        canceled = stripeHelper.filterSubscriptionByMetadata(
          canceled,
          config?.tag,
        );
      }

      const totalActiveSubscriptions = subscriptions?.length || 0;
      const totalSubscribers = subscribers?.length || 0;
      // churn rate formulae: ((total subs - total active subs) / total subscribers) ...... represented as a % (*100) and also only THEIR subscribers
      const churnRatePercentage = (canceled?.length / totalSubscribers) * 100;

      // ((totalChurnRate / totalChurnRate - totalSubscriptions) /
      //   totalChurnRate) *
      // 100;

      // count revenue loss by churn rate
      let churnedRevenue;
      for (const subscription of subscribers) {
        const subscriptionItems = await stripe.subscriptionItems
          .list({
            subscription: subscription?.id,
          })
          .then(({ data }) => data);
        // group loss by month
        const groupedByMonth = groupBy(subscriptionItems, (item) => {
          return moment.unix(item?.created).format('M');
        });

        churnedRevenue = moment.months().map((month, index) => {
          return {
            month,
            monthShort: moment.monthsShort()[index],
            amount:
              stripeHelper.sumTotalChurnedRevenue(groupedByMonth[index + 1]) ||
              0,
          };
        });
      }
      return {
        reportDate: moment().valueOf(),
        activeSubscriptions: totalActiveSubscriptions,
        canceled: canceled.length,
        churnedSubscriptions: totalSubscribers,
        churnRate: churnRatePercentage,
        churnedRevenue,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get stripe CPA
   * CPA: Total cost spent / customers
   * @returns
   */
  async getStripeCPA(userId) {
    try {
      const config = await this.getStripeConfig(userId);
      if (!config?.secretKey || !config?.publishableKey) {
        throw new Error('Stripe configuration invalid.');
      }
      const stripe = new Stripe(config?.secretKey, {
        apiVersion: null,
      });
      // all balance transactions
      const balanceTransactions = await stripe.balanceTransactions.list({
        created: {
          gte: moment().startOf('year').unix(),
          lte: moment().endOf('year').unix(),
        },
      });

      // count revenue loss by churn rate
      let data;
      let totalSubscriptions = 0;
      for (const subscription of balanceTransactions?.data) {
        const subscribers = await stripe.customers.list({
          created: {
            gte: moment
              .unix(subscription?.created)
              .startOf('year')
              .unix(),
            lte: moment
              .unix(subscription?.created)
              .endOf('year')
              .unix(),
          },
        });
        totalSubscriptions += subscribers?.data?.length || 0;
        // group loss by month
        const groupedByMonth = groupBy(subscribers?.data, (item) => {
          return moment.unix(item?.created).format('M');
        });

        data = moment.months().map((month, index) => {
          const cpa =
            balanceTransactions?.data?.length / groupedByMonth?.[index]?.length;
          return {
            month,
            monthShort: moment.monthsShort()[index],
            transaction: groupedByMonth?.[index]?.length || 0,
            cpa: cpa || 0,
            subscribers,
          };
        });
      }
      return {
        reportDate: moment().valueOf(),
        totalSubscriptions,
        totalTransaction: balanceTransactions?.data?.length || 0,
        data,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get stripe Customers
   * CPA: Total cost spent / customers
   * @returns
   */
  async getStripeCustomers(userId, query?: Record<string, any>) {
    try {
      const config = await this.getStripeConfig(userId);
      // if (!config?.secretKey || !config?.publishableKey) {
      //   throw new Error('Stripe configuration invalid.');
      // }

      const reportType = query?.reportType || 'this_year';

      const getCustomers = async (isUserAccount = false) => {
        let customers: any[];
        switch (reportType) {
          case 'last_month':
            // last month, get from 1st day of last month to last day of last month in invoices
            customers = await stripeApi.getStripeSubscription(config, {
              unixMin: moment().subtract(1, 'months').startOf('month').unix(),
              unixMax: moment().subtract(1, 'months').endOf('month').unix(),
              useAccount: isUserAccount,
            });

            break;
          case 'last_week': {
            // last week, get from 1st day of last week to last day of last week in invoices
            customers = await stripeApi.getStripeSubscription(config, {
              unixMin: moment().subtract(1, 'weeks').startOf('week').unix(),
              unixMax: moment().subtract(1, 'weeks').endOf('week').unix(),
              useAccount: isUserAccount,
            });
            break;
          }
          case 'this_month':
            customers = await stripeApi.getStripeSubscription(config, {
              unixMin: moment().startOf('month').unix(),
              unixMax: moment().unix(),
              useAccount: isUserAccount,
            });
            break;
          case 'this_year':
            customers = await stripeApi.getStripeSubscription(config, {
              unixMin: 0,
              unixMax: moment().unix(),
              useAccount: isUserAccount,
            });
            break;
          case 'last_year':
            customers = await stripeApi.getStripeSubscription(config, {
              unixMin: moment().subtract(1, 'years').startOf('year').unix(),
              unixMax: moment().subtract(1, 'years').endOf('year').unix(),
              useAccount: isUserAccount,
            });
            break;
          default:
            customers = await stripeApi.getStripeSubscription(config, {
              unixMin: moment().subtract(1, 'weeks').startOf('week').unix(),
              unixMax: moment().subtract(1, 'weeks').endOf('week').unix(),
              useAccount: isUserAccount,
            });
        }
        customers = customers.filter(
          (v) =>
            v.status === 'active' ||
            v.status === 'trialing' ||
            v.status === 'past_due',
        );

        if (config?.tag && !isUserAccount) {
          customers = stripeHelper.filterSubscriptionByMetadata(
            customers,
            config?.tag,
          );
        }
        return customers;
      };
      let customers = await getCustomers();
      // if user has connected their stripe account in IAN, get their customers and merge it with current customers
      if (config?.stripeUserId) {
        const userCustomers = await getCustomers(true);
        customers = customers.concat(userCustomers);
      }

      let data = [];
      const stats = {
        label: [],
        data: [],
      };

      if (reportType == 'this_year' || reportType == 'last_year') {
        const groupedByMonth = groupBy(customers, (trx) => {
          return moment.unix(trx?.created).format('M');
        });
        data = moment.months().map((month, index) => {
          return {
            month,
            monthShort: moment.monthsShort()[index],
            customers: groupedByMonth?.[index + 1]?.length || 0,
          };
        });
        stats.data = moment
          .months()
          .map((month, index) => {
            // get this year's month, remove rest of the months
            const thisMonth = moment().month();
            if (index > thisMonth) {
              return null;
            }
            return {
              label: month,
              labelShort: moment.monthsShort()[index],
              value: groupedByMonth?.[index + 1]?.length || 0,
            };
          })
          .filter(Boolean);
        stats.label = moment
          .months()
          .map((_, index) => {
            const thisMonth = moment().month();
            if (index > thisMonth) {
              return null;
            }
            return moment.monthsShort()[index];
          })
          .filter(Boolean);
      } else if (reportType == 'this_month' || reportType == 'last_month') {
        const groupedByDay = groupBy(customers, (trx) => {
          return Number(moment.unix(trx?.created).date());
        });
        stats.data = Array.from(Array(moment().daysInMonth()).keys()).map(
          (date, index) => {
            return {
              label: date + 1,
              labelShort: moment()
                .date(date + 1)
                .format('ddd'),
              value: groupedByDay?.[index + 1]?.length || 0,
            };
          },
        );
        stats.label = Array.from(Array(moment().daysInMonth()).keys()).map(
          (date) => date + 1,
        );
      } else if (reportType == 'this_week' || reportType == 'last_week') {
        const groupedByDay = groupBy(customers, (trx) => {
          return moment.unix(trx?.created).format('dddd');
        });
        stats.data = moment.weekdays().map((day, index) => {
          return {
            day,
            dayShort: moment.weekdaysShort()[index],
            amount: stripeHelper.sumFormattedInvoices(groupedByDay[day]),
          };
        });
        stats.label = moment
          .weekdays()
          .map((_, index) => moment.weekdaysShort()[index]);
      }

      const activeCustomers = customers.filter(
        (v) => v.status === 'active' || v.status === 'trialing',
      );

      return {
        reportDate: moment().valueOf(),
        totalCustomers: customers?.length || 0,
        stats,
        data,
        customers,
        activeCustomers,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get stripe customer growth, this year vs last year
   */
  async getStripeCustomerGrowth(userId) {
    try {
      const config = await this.getStripeConfig(userId);
      if (!config?.secretKey || !config?.publishableKey) {
        throw new Error('Stripe configuration invalid.');
      }

      let thisYearCustomers = await stripeApi.getStripeSubscription(config, {
        unixMin: UNIX_YEAR_START,
        unixMax: UNIX_YEAR_END,
      });
      let lastYearCustomers = await stripeApi.getStripeSubscription(config, {
        unixMin: UNIX_LAST_YEAR_START,
        unixMax: UNIX_LAST_YEAR_END,
      });

      if (config?.tag) {
        thisYearCustomers = stripeHelper.filterSubscriptionByMetadata(
          thisYearCustomers,
          config?.tag,
        );
        lastYearCustomers = stripeHelper.filterSubscriptionByMetadata(
          lastYearCustomers,
          config?.tag,
        );
      }
      // group by month
      const groupedByMonthThisYear = groupBy(thisYearCustomers, (trx) => {
        return moment.unix(trx?.created).format('M');
      });
      const groupedByMonthLastYear = groupBy(lastYearCustomers, (trx) => {
        return moment.unix(trx?.created).format('M');
      });
      const monthlyCustomers = moment
        .months()
        .map((month, index) => {
          // check this month
          const thisMonth = moment().month();
          // return null if this month is not yet
          if (index > thisMonth) {
            return null;
          }
          return {
            month,
            monthShort: moment.monthsShort()[index],
            thisYear: groupedByMonthThisYear?.[index]?.length || 0,
            lastYear: groupedByMonthLastYear?.[index]?.length || 0,
          };
        })
        .filter(Boolean);
      // get this month transaction

      const thisMonthTrx = await stripeApi.getStripeInvoices(config, {
        unixMin: UNIX_MONTH_START,
        unixMax: UNIX_MONTH_END,
      });
      const lastMonthTrx = await stripeApi.getStripeInvoices(config, {
        unixMin: UNIX_LAST_MONTH_START,
        unixMax: UNIX_LAST_MONTH_END,
      });

      const thisMonthtotalTransaction =
        stripeHelper.sumTotalInvoiceTrx(thisMonthTrx);
      const lastMonthtotalTransaction =
        stripeHelper.sumTotalInvoiceTrx(lastMonthTrx);
      return {
        reportDate: moment().valueOf(),
        totalCustomers: thisYearCustomers?.length || 0,
        data: monthlyCustomers,
        trx: {
          thisMonth: thisMonthtotalTransaction,
          lastMonth: lastMonthtotalTransaction,
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      return await this.financeModel.find(query).populate({
        path: 'user',
        model: User.name,
        populate: {
          path: 'business',
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async triggerZapWebhook(body: Record<string, any>) {
    const url = 'https://hooks.zapier.com/hooks/catch/8366730/31zbzcq/';
    const call = await api.post(url, body).then(({ data }) => data);
    return call;
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
        amount: body?.data?.object?.amount || body?.data?.object?.plan?.amount,
        tag: body?.data?.object?.metadata?.builderName,
        account_id: account?.id || '-',
        discord_username: user?.discordUsername || '-',
        customer: body?.data?.object?.customer,
      };
      // trigger zapier webhook
      await this.triggerZapWebhook(data);
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
