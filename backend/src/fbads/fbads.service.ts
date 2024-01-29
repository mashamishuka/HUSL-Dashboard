import * as CryptoJS from 'crypto-js';
import * as bizSdk from 'facebook-nodejs-business-sdk';
import {
  availableAdSetFields,
  availableAdsFields,
  availableCampaignFields,
  sumTotalCpc,
} from 'helpers/fbAds';
import { groupBy } from 'lodash';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';

import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateFbadDto } from './dto/create-fbad.dto';
import { FbAds } from './fbads.schema';

Object.defineProperty(bizSdk.FacebookAdsApi, 'VERSION', { get: () => 'v16.0' });

@Injectable()
export class FbadsService {
  constructor(
    @InjectModel(FbAds.name) private fbAdsModel: Model<FbAds>,
    private userService: UsersService,
  ) {}

  /**
   * Each user should save its configuration in the database before performing each action
   * @param createFbadDto
   * @returns
   */
  async createConfig(createFbadDto: CreateFbadDto) {
    if (createFbadDto.adAccountId?.startsWith('act_') === false) {
      createFbadDto.adAccountId = `act_${createFbadDto.adAccountId}`;
    }
    const user = await this.userService.findOne(createFbadDto.user);

    // encrypt the access token
    if (createFbadDto?.token) {
      const keyFormula = `${user?._id}_${createFbadDto.adAccountId}`;
      createFbadDto.token = CryptoJS.AES.encrypt(
        createFbadDto.token,
        keyFormula,
      ).toString();
      createFbadDto.hasToken = true;
    }
    const currentFbAd = await this.fbAdsModel.findOne({
      user: createFbadDto.user,
    });
    // if the user already has a configuration, update it
    if (currentFbAd) {
      return await this.fbAdsModel.findOneAndUpdate(
        { user: createFbadDto.user },
        createFbadDto,
        { new: true },
      );
    } else {
      return await this.fbAdsModel.create(createFbadDto);
    }
    // try {
    //   if (createFbadDto.adAccountId?.startsWith('act_') === false) {
    //     createFbadDto.adAccountId = `act_${createFbadDto.adAccountId}`;
    //   }
    //   const user = await this.userService.findOne(createFbadDto.user);

    //   // encrypt the access token
    //   if (createFbadDto?.token) {
    //     const keyFormula = `${user?._id}_${createFbadDto.adAccountId}`;
    //     createFbadDto.token = CryptoJS.AES.encrypt(
    //       createFbadDto.token,
    //       keyFormula,
    //     ).toString();
    //     createFbadDto.hasToken = true;
    //   }
    //   const currentFbAd = await this.fbAdsModel.findOne({
    //     user: createFbadDto.user,
    //   });
    //   // if the user already has a configuration, update it
    //   if (currentFbAd) {
    //     return await this.fbAdsModel.findOneAndUpdate(
    //       { user: createFbadDto.user },
    //       createFbadDto,
    //       { new: true },
    //     );
    //   } else {
    //     return await this.fbAdsModel.create(createFbadDto);
    //   }
    // } catch (error) {
    //   throw new HttpException(error, error?.response?.statusCode);
    // }
  }

  async findOne(userId: number) {
    try {
      const fbAd = await this.fbAdsModel.findOne({
        user: userId,
      });

      return fbAd;
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  /**
   * This is private method to get the user fb ads configuration, include its token
   * @param userId
   * @returns
   */
  private async getFbAdsConfig(userId: number) {
    try {
      const fbAd = await this.fbAdsModel
        .findOne({
          user: userId,
        })
        .populate('user');

      if (fbAd?.hasToken && fbAd?.token) {
        const keyFormula = `${(fbAd?.user as any)?._id}_${fbAd?.adAccountId}`;
        const bytes = CryptoJS.AES.decrypt(fbAd?.token, keyFormula);

        const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
        return {
          token: decryptedToken,
          adAccountId: fbAd?.adAccountId,
        };
      } else {
        return null;
      }
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  /**
   * Test fb ads token
   */
  async checkToken(userId: number) {
    try {
      const config = await this.getFbAdsConfig(userId);
      if (!config?.token) {
        throw new HttpException('No access token found', 400);
      }

      bizSdk.FacebookAdsApi.init(config?.token);
      const adAccount = bizSdk.AdAccount;
      const account = new adAccount(config?.adAccountId);
      if (account) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
      // throw new HttpException(error, error?.response?.statusCode);
    }
  }

  /**
   * Create FB Ads Campaign
   * @returns
   */
  async createCampaign(
    userId: number,
    body?: Record<string, any>,
    query?: Record<string, any>,
  ) {
    try {
      // check query
      if (query?.fields) {
        const fields = query.fields?.split(',');
        const invalidFields = fields.filter(
          (field) => !availableCampaignFields.includes(field),
        );
        if (invalidFields.length > 0) {
          throw new HttpException(
            `Invalid fields: ${invalidFields.join(
              ',',
            )}. Available fields are ${availableCampaignFields?.join(', ')}`,
            400,
          );
        }
      }

      // get user fb ads configuration
      const config = await this.getFbAdsConfig(userId);

      if (!config?.token) {
        throw new HttpException('No access token found', 400);
      }
      bizSdk.AdRule;
      bizSdk.FacebookAdsApi.init(config?.token);

      const AdAccount = bizSdk.AdAccount;
      // const Campaign = bizSdk.AdSet;
      const account = new AdAccount(config?.adAccountId);
      const campaign = await account.createCampaign([], body).then((res) => {
        return res;
      });
      return campaign;
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  /**
   * Get FB Ads Campaign
   * @returns
   */
  async getCampaigns(userId: number, query?: Record<string, any>) {
    try {
      // check query
      if (query?.fields) {
        const fields = query.fields?.split(',');
        const invalidFields = fields.filter(
          (field) => !availableCampaignFields.includes(field),
        );
        if (invalidFields.length > 0) {
          throw new HttpException(
            `Invalid fields: ${invalidFields.join(
              ',',
            )}. Available fields are ${availableCampaignFields?.join(', ')}`,
            400,
          );
        }
      }

      // get user fb ads configuration
      const config = await this.getFbAdsConfig(userId);

      if (!config?.token) {
        throw new HttpException('No access token found', 400);
      }
      bizSdk.AdRule;
      bizSdk.FacebookAdsApi.init(config?.token);

      const AdAccount = bizSdk.AdAccount;
      const Campaign = bizSdk.AdSet;
      const account = new AdAccount(config?.adAccountId);

      return account
        .getCampaigns([
          Campaign.Fields.name,
          Campaign.Fields.status,
          Campaign.Fields.lifetime_budget,
          Campaign.Fields.daily_budget,
          Campaign.Fields.budget_remaining,
          Campaign.Fields.optimization_goal,
          ...(query?.fields?.split(',') || []),
        ])
        .then((campaigns) => {
          return campaigns?.map((v) => v._data);
        })
        .catch((error) => {
          throw new HttpException(error, error?.response?.statusCode);
        });
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  /**
   * Get FB Ads Campaign by ID
   * @returns
   */
  async getCampaignById(
    userId: number,
    campaignId: number,
    query?: Record<string, any>,
  ) {
    try {
      // check query
      if (query?.fields) {
        const fields = query.fields?.split(',');
        const invalidFields = fields.filter(
          (field) => !availableCampaignFields.includes(field),
        );
        if (invalidFields.length > 0) {
          throw new HttpException(
            `Invalid fields: ${invalidFields.join(
              ',',
            )}. Available fields are ${availableCampaignFields?.join(', ')}`,
            400,
          );
        }
      }

      // get user fb ads configuration
      const config = await this.getFbAdsConfig(userId);

      if (!config?.token) {
        throw new HttpException('No access token found', 400);
      }
      bizSdk.AdRule;
      bizSdk.FacebookAdsApi.init(config?.token);

      const AdAccount = bizSdk.AdAccount;
      const Campaign = bizSdk.AdSet;
      const account = new AdAccount(config?.adAccountId);
      const campaigns = await account
        .getCampaigns([
          Campaign.Fields.name,
          Campaign.Fields.status,
          Campaign.Fields.lifetime_budget,
          Campaign.Fields.daily_budget,
          Campaign.Fields.budget_remaining,
          ...(query?.fields?.split(',') || []),
        ])
        .then((campaigns) => {
          return campaigns?.map((v) => v._data);
        })
        .catch((error) => {
          throw new HttpException(error, error?.response?.statusCode);
        });
      const filteredCampaignById = campaigns?.filter((campaign) => {
        return campaign.id == campaignId;
      })?.[0];

      if (!filteredCampaignById) {
        throw new NotFoundException('Campaign not found');
      }

      return filteredCampaignById;
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  async updateCampaign(
    userId: number,
    campaignId?: string,
    body?: Record<string, any>,
  ) {
    try {
      // check query
      const fields = Object.keys(body);
      const invalidFields = fields.filter(
        (field) => !availableCampaignFields.includes(field),
      );
      if (invalidFields.length > 0) {
        throw new HttpException(
          `Invalid body: ${invalidFields.join(',')}`,
          400,
        );
      }

      // get user fb ads configuration
      const config = await this.getFbAdsConfig(userId);

      if (!config?.token) {
        throw new HttpException('No access token found', 400);
      }
      bizSdk.AdRule;
      bizSdk.FacebookAdsApi.init(config?.token);

      const Campaign = bizSdk.Campaign;
      const data = await new Campaign(campaignId, {
        ...body,
      }).update({ ...body });

      if (data) {
        return data;
      } else {
        throw new HttpException('Update campaign failed', 400);
      }
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  async getAdSets(userId: number, query?: Record<string, any>) {
    try {
      // check query
      if (query?.fields) {
        const fields = query.fields?.split(',');
        const invalidFields = fields.filter(
          (field) => !availableAdSetFields.includes(field),
        );
        if (invalidFields.length > 0) {
          throw new HttpException(
            `Invalid fields: ${invalidFields.join(
              ',',
            )}. Available fields are ${availableAdSetFields?.join(', ')}`,
            400,
          );
        }
      }

      // get user fb ads configuration
      const config = await this.getFbAdsConfig(userId);

      if (!config?.token) {
        throw new HttpException('No access token found', 400);
      }
      bizSdk.AdRule;
      bizSdk.FacebookAdsApi.init(config?.token);

      const AdAccount = bizSdk.AdAccount;
      const AdSet = bizSdk.AdSet;
      const account = new AdAccount(config?.adAccountId);

      return account
        .getAdSets([
          AdSet.Fields.name,
          AdSet.Fields.status,
          AdSet.Fields.lifetime_budget,
          AdSet.Fields.daily_budget,
          AdSet.Fields.bid_amount,
          AdSet.Fields.budget_remaining,
          AdSet.Fields.targeting,
          AdSet.Fields.campaign,
          AdSet.Fields.is_dynamic_creative,
          AdSet.Fields.optimization_goal,
          AdSet.Fields.creative_sequence,
          AdSet.Fields.adset_schedule,
          AdSet.Fields.promoted_object,
          AdSet.Fields.targeting_optimization_types,
          ...(query?.fields?.split(',') || []),
        ])
        .then((adSets) => {
          return adSets?.map((v) => v?._data);
        })
        .catch((error) => {
          throw new HttpException(error, error?.response?.statusCode);
        });
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  async updateAdSet(
    userId: number,
    adsetId?: string,
    body?: Record<string, any>,
  ) {
    try {
      // check query
      const fields = Object.keys(body);
      const invalidFields = fields.filter(
        (field) => !availableCampaignFields.includes(field),
      );
      if (invalidFields.length > 0) {
        throw new HttpException(
          `Invalid body: ${invalidFields.join(',')}`,
          400,
        );
      }

      // get user fb ads configuration
      const config = await this.getFbAdsConfig(userId);

      if (!config?.token) {
        throw new HttpException('No access token found', 400);
      }
      bizSdk.AdRule;
      bizSdk.FacebookAdsApi.init(config?.token);

      const Adset = bizSdk.AdSet;
      const data = await new Adset(adsetId, {
        ...body,
      }).update({ ...body });

      if (data) {
        return data;
      } else {
        throw new HttpException('Update adset failed', 400);
      }
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  /**
   * Get FB Ads Ad
   */
  async getAds(userId: number, query?: Record<string, any>) {
    try {
      // check query
      if (query?.fields) {
        const fields = query.fields?.split(',');
        const invalidFields = fields.filter(
          (field) => !availableAdsFields.includes(field),
        );
        if (invalidFields.length > 0) {
          throw new HttpException(
            `Invalid fields: ${invalidFields.join(
              ',',
            )}. Available fields are ${availableAdsFields?.join(', ')}`,
            400,
          );
        }
      }

      // get user fb ads configuration
      const config = await this.getFbAdsConfig(userId);

      if (!config?.token) {
        throw new HttpException('No access token found', 400);
      }
      bizSdk.AdRule;
      bizSdk.FacebookAdsApi.init(config?.token);

      const AdAccount = bizSdk.AdAccount;
      const Ad = bizSdk.Ad;
      const account = new AdAccount(config?.adAccountId);

      return account
        .getAds([
          Ad.Fields.name,
          Ad.Fields.status,
          Ad.Fields.bid_amount,
          Ad.Fields.created_time,
          // Ad.Fields.tracking_specs,
          // Ad.Fields.tracking_and_conversion_with_defaults,
          'adset{name,budget_remaining,targeting,status,campaign}',
          'campaign{name,status,lifetime_budget,daily_budget,budget_remaining,buying_type}',
          'creative{name,thumbnail_url}',
          ...(query?.fields?.split(',') || []),
        ])
        .then((ad) => {
          return ad?.map((v) => v?._data);
        })
        .catch((error) => {
          throw new HttpException(error, error?.response?.statusCode);
        });
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  /**
   * Update FB Ads Ad
   */
  async updateAd(userId: number, adId?: string, body?: Record<string, any>) {
    try {
      // check query
      const fields = Object.keys(body);
      const invalidFields = fields.filter(
        (field) => !availableAdsFields.includes(field),
      );
      if (invalidFields.length > 0) {
        throw new HttpException(
          `Invalid body: ${invalidFields.join(',')}`,
          400,
        );
      }

      // get user fb ads configuration
      const config = await this.getFbAdsConfig(userId);

      if (!config?.token) {
        throw new HttpException('No access token found', 400);
      }
      bizSdk.AdRule;
      bizSdk.FacebookAdsApi.init(config?.token);

      const Ad = bizSdk.Ad;
      const data = await new Ad(adId, {
        ...body,
      }).update({ ...body });

      if (data) {
        return data;
      } else {
        throw new HttpException('Update ad failed', 400);
      }
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  /**
   * Get FB ads CPC
   */
  async getFbAdsCPC(userId: number, query?: Record<string, any>) {
    try {
      // get user fb ads configuration
      const config = await this.getFbAdsConfig(userId);

      if (!config?.token) {
        throw new HttpException('No access token found', 400);
      }
      bizSdk.AdRule;
      bizSdk.FacebookAdsApi.init(config?.token);

      const AdAccount = bizSdk.AdAccount;
      const account = new AdAccount(config?.adAccountId);
      const args = {
        date_preset: 'this_year',
      };

      // check period type, default to yearly above
      if (query?.period_type === 'monthly') {
        args.date_preset = 'this_month';
      }
      if (query?.periodType === 'weekly') {
        args.date_preset = 'this_week_sun_today';
      }

      const insights = await account
        .getInsights(
          [
            'ad_name',
            'account_id',
            'account_currency',
            'spend',
            'website_ctr',
            'cpc',
            'cpm',
            'cpp',
            'ctr',
            'created_time',
          ],
          args,
        )
        .then((campaigns) => {
          return campaigns?.map((v) => v?._data);
        })
        .catch((error) => {
          throw new HttpException(error, error?.response?.statusCode);
        });

      let cpcReport = {};
      // group insights cpc by month
      if (query?.periodType === 'yearly' || !query?.periodType) {
        const groupedByMonth = groupBy(insights, (trx) => {
          return moment(trx.date_stop).format('M');
        });
        cpcReport = moment.months().map((month, index) => {
          return {
            month,
            monthShort: moment.monthsShort()[index],
            cpc: sumTotalCpc(groupedByMonth[index + 1]) || 0,
          };
        });
      } else if (query?.periodType === 'monthly') {
        // group insights cpc by week
        const groupedByWeek = groupBy(insights, (trx) => {
          return moment(trx.date_stop).format('D');
        });
        cpcReport = [...Array(moment().daysInMonth())].map((_, index) => {
          return {
            date: index + 1,
            day: moment().date(index).format('dddd'),
            dayShort: moment().date(index).format('ddd'),
            cpc: sumTotalCpc(groupedByWeek[index + 1]) || 0,
          };
        });
      } else if (query?.periodType === 'weekly') {
        // if weekly, group by week
        const groupedByDay = groupBy(insights, (trx) => {
          return moment(trx.date_stop).day();
        });
        cpcReport = moment.weekdays().map((day, index) => {
          return {
            date: index + 1,
            day,
            dayShort: moment.weekdaysShort()[index],
            cpc: sumTotalCpc(groupedByDay[index + 1]) || 0,
          };
        });
      }
      let timeRange = {};
      if (query?.periodType === 'yearly' || !query?.periodType) {
        timeRange = {
          start: moment().startOf('year').format('YYYY-MM-DD'),
          end: moment().endOf('year').format('YYYY-MM-DD'),
        };
      } else if (query?.periodType === 'monthly') {
        timeRange = {
          start: moment().startOf('month').format('YYYY-MM-DD'),
          end: moment().endOf('month').format('YYYY-MM-DD'),
        };
      } else if (query?.periodType === 'weekly') {
        timeRange = {
          start: moment().startOf('week').format('YYYY-MM-DD'),
          end: moment().endOf('week').format('YYYY-MM-DD'),
        };
      }

      return {
        periodType: query?.periodType || 'monthly',
        datePreset: args.date_preset,
        timeRange,
        cpc: cpcReport,
      };
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }
}
