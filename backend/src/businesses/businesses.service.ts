import api, { webHuslApi } from 'helpers/api';
import { addHttp, replaceBulk, url_slug } from 'helpers/common';
import { filterSubscriptionByMetadata } from 'helpers/stripe';
import { groupBy } from 'lodash';
import * as moment from 'moment';
import { Model, Types } from 'mongoose';
import { AccountsService } from 'src/accounts/accounts.service';
import { File } from 'src/files/files.schema';
import { FinancesService } from 'src/finances/finances.service';
import { Niche } from 'src/niches/niches.schema';
import { SocialAccountsService } from 'src/social-accounts/social-accounts.service';
import { User } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as stripeApi from '../../helpers/stripeAPI';
import { Business } from './businesses.schema';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<Business>,
    private financeService: FinancesService,
    private userService: UsersService,
    private accountService: AccountsService,
    private socialAccountService: SocialAccountsService,
  ) {}

  async instantappRootLogin() {
    try {
      const login = await api
        .post('https://instantappnow.herokuapp.com/rest/login', {
          email: 'super@super.com',
          password: 'Super@1!!',
        })
        .then(({ data }) => data);
      return login;
    } catch (error) {
      throw new Error(error);
    }
  }
  async create(createBusinessDto: CreateBusinessDto) {
    try {
      const createdBusiness = await this.businessModel.create({
        ...createBusinessDto,
      });
      return createdBusiness;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const page = Number(query?.page) || 0;
      const limit = Number(query?.limit) || 0;
      const data = await this.businessModel
        .find(query)
        .where('deleted', false)
        .populate('product')
        .populate('user')
        .populate({
          path: 'niche',
          model: 'niche',
          populate: {
            path: 'productMockups',
            populate: [
              {
                path: 'mockups',
                model: File.name,
              },
              {
                path: 'mobileMockups',
                model: File.name,
              },
              {
                path: 'desktopMockups',
                model: File.name,
              },
            ],
          },
        })
        .populate(['logo', 'favicon', 'generatedGraphics', 'stripeConfig'])
        .sort(query?.sort || {})
        .skip(((page || 0) - 1) * (limit || 0))
        .limit(limit || 0);
      // .select('-accounts');
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.businessModel
        .findById(id)
        .where('deleted', false)
        .populate('product')
        .populate({
          path: 'niche',
          model: Niche.name,
          populate: {
            path: 'productMockups',
            populate: [
              {
                path: 'mockups',
                model: File.name,
              },
              {
                path: 'mobileMockups',
                model: File.name,
              },
              {
                path: 'desktopMockups',
                model: File.name,
              },
            ],
          },
        })
        .populate(['logo', 'favicon', 'generatedGraphics', 'user']);
      // .select('-accounts');
      // remove password from user
      if (data?.user?.password) {
        data.user.password = null;
      }
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async businessOverview(userId: string) {
    try {
      const user = await this.userService.findOne(userId);
      const config = await this.financeService.getStripeConfig(userId);
      // const invoices = await this.financeService.getInvoices(userId);
      const last90Days = moment().subtract(90, 'days').unix();
      const subscription = await stripeApi.getStripeSubscription(config, {
        unixMin: last90Days,
        unixMax: moment().unix(),
      });
      const customers = filterSubscriptionByMetadata(subscription, config?.tag);
      // group customers by week in last 90 days
      const csGroupedByDay = groupBy(customers, (trx) => {
        return moment.unix(trx?.created).format('d');
      });

      const csStatData = [...Array(90)].map((_, index) => {
        return {
          day: index + 1,
          amount: csGroupedByDay[index + 1]?.length,
        };
      });

      // login to instantapp and get its token
      const instantappToken = await this.instantappRootLogin().then(
        (data) => data?.token,
      );
      const leadsCount = await api
        .get(
          `https://instantappnow.herokuapp.com/rest/users?take=0&companyDomain=${user?.productUrl}`,
          {
            headers: {
              Authorization: `Bearer ${instantappToken}`,
            },
          },
        )
        .then(({ data }) => data?.count);

      return {
        customers: customers?.length,
        leads: leadsCount,
        influence: 0,
        activeCustomers: {
          total: customers?.length,
          labels: csStatData?.map((item) => item.day),
          data: csStatData?.map((item) => item.amount || 0),
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async generateHuslWeb(
    business: Business & {
      _id: Types.ObjectId;
    },
    body?: UpdateBusinessDto & {
      productUrl?: string;
    },
  ) {
    // get the website template, get from product
    const huslWeb = await webHuslApi
      .get('/website/' + business.product?.websiteKey)
      ?.then((res) => res.data);
    // get copy from niche
    const tagCopy = business?.niche?.tagCopy;
    const copyFrom = tagCopy?.map((v) => v.key);
    const copyTo = tagCopy?.map((v) => v.value);
    // this is default copy, you might want to make it dynamic
    copyFrom.push(
      '[niche]',
      '[company]',
      '[primary color]',
      '[secondary color]',
      '[logo]',
      '[favicon]',
      '[domain]',
      '[product url]',
    );
    copyTo.push(
      business?.niche?.name,
      business?.name,
      business?.primaryColor,
      business?.secondaryColor,
      business?.logo?.url,
      business?.favicon?.url,
      business?.domain,
      addHttp(body?.productUrl),
    );

    // replace copy
    const html = replaceBulk(huslWeb?.html, copyFrom, copyTo);
    const thank_you_page_html = replaceBulk(
      huslWeb?.thank_you_page_html,
      copyFrom,
      copyTo,
    );
    const custom_header = replaceBulk(huslWeb?.custom_header, copyFrom, copyTo);
    const custom_footer = replaceBulk(huslWeb?.custom_footer, copyFrom, copyTo);
    const styles = replaceBulk(huslWeb?.styles, copyFrom, copyTo);
    const css = replaceBulk(huslWeb?.css, copyFrom, copyTo);
    const components = replaceBulk(huslWeb?.components, copyFrom, copyTo);

    // prepare object to generate website
    const generateWebsite = {
      ...huslWeb,
      ...body,
      name: business?.name,
      html,
      thank_you_page_html,
      custom_domain: business?.domain,
      huslapp_businessId: business?._id,
      seo_title: business?.name,
      logo: business?.logo?.url,
      favicon: business?.favicon?.url,
      custom_header,
      custom_footer,
      styles,
      css,
      components,
      product_url: body?.productUrl,
    };
    // remove unnecessary fields
    delete generateWebsite?.id;
    delete generateWebsite?.created_at;
    delete generateWebsite?.updated_at;
    // generate business
    const generatedBusiness = await webHuslApi
      .post('/generate-business', generateWebsite)
      ?.then((res) => res?.data)
      .catch((e) => {
        Logger.error(e);
        return null;
      });
    return generatedBusiness;
  }

  async generateWhitelabelAccount(
    business: Business & {
      _id: Types.ObjectId;
    },
  ) {
    const res: Record<string, any> = {};
    let user: User & {
      _id: string;
    } = null;
    if (!business?.user) {
      user = await this.userService.findOneByQuery({
        email: business?.accounts?.email?.email,
      });
    } else {
      user = await this.userService.findOne(business?.user);
    }

    let userId = user?._id || null;
    const nftId = business?.accounts?.email?.nftId || user?.nftId;
    if (!userId) {
      const createdUser = await this.userService.create({
        email: business?.accounts?.email?.email || user?.email,
        password: business?.accounts?.email?.password || user?._id?.toString(),
        name: business?.name,
        websiteKey: business?.product?.websiteKey,
        nftId,
        business: [business?._id?.toString()],
      });
      userId = createdUser?._id;
    }

    if (business?.accounts?.email?.email || user) {
      // also create an instantapp whitelabel account, ignore if already exists
      const whitelabelData = JSON.stringify({
        query: `mutation SIGN_UP(
          $email: String!
          $password: String!
          $name: String!
          $logo: String
          $companyName: String
          $icon: String
        ) {
          signupSuperAdmin(
            email: $email
            password: $password
            name: $name
            logo: $logo
            icon: $icon
            companyName: $companyName
          ) {
            token
            user {
              id
              email
              builderDomain
            }
          }
        }`,
        variables: {
          email: business?.accounts?.email?.email || user?.email,
          password: business?.accounts?.email?.password || user?._id,
          logo: business?.logo?.url,
          icon: business?.favicon?.url,
          name: business?.name,
          companyName: business?.name,
        },
      });
      // console.log({
      //   variables: {
      //     email: business?.accounts?.email?.email || user?.email,
      //     password:
      //       business?.accounts?.email?.password || user?._id?.toString(),
      //     logo: business?.logo?.url,
      //     icon: business?.favicon?.url,
      //     name: business?.name,
      //     companyName: business?.name,
      //   },
      // });
      const whitelabelAccount = await api
        .post('https://instantappnow.herokuapp.com/graphql', whitelabelData)
        .then(async ({ data }) => {
          // console.log(data, data?.errors, data?.data);
          const errors = data?.errors?.map((v) => v?.message);
          if (errors?.length) {
            // await this.userService
            //   .remove(userId)
            //   .catch((e) => console.error(e));
            throw new InternalServerErrorException(
              'Error creating whitelabel account',
              errors,
            );
          }
          if (data?.data) {
            return data;
          }
          throw new InternalServerErrorException(
            'Error creating whitelabel account',
            'No data returned',
          );
        })
        .catch(async (e) => {
          console.log(e);
          // await this.userService.remove(userId).catch((e) => console.error(e));
          throw new InternalServerErrorException(
            'Error creating whitelabel account',
            e?.message,
          );
        });
      const subdomainFallback =
        url_slug(business?.name) + '.' + 'instantappnow.com';
      // update stripe config white label tags
      // create or get user account with this email
      const existingBusiness =
        user?.business?.map((v) => (v as any)._id?.toString()) || [];
      // merge and remove duplicates
      existingBusiness.push(business?._id?.toString());
      const uniqueBusiness = [...new Set(existingBusiness)].filter(Boolean);
      // update user
      await this.userService.update(userId, {
        name: business?.name,
        websiteKey: business?.product?.websiteKey,
        productUrl:
          whitelabelAccount?.data?.signupSuperAdmin?.user?.builderDomain ||
          subdomainFallback,
        business: uniqueBusiness,
      });
      // save user to business
      if (whitelabelAccount?.data?.signupSuperAdmin?.user?.id) {
        const stripeConfigData = {
          userId: userId,
          whitelabelTag:
            whitelabelAccount?.data?.signupSuperAdmin?.user?.builderDomain ||
            subdomainFallback,
          publishableKey:
            'pk_live_51KEd9CAPLvWOdASV9nJmLC3FxGZ8CmNN8flwSIDgtbgJIJtMmsA0PBH53dP6KrqohJQpE0FUVzFNtWhSxhmPv6pL00JHkgLA5d',
          secretKey:
            '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',
        };

        // update stripe config white label tags
        const configCreated =
          await this.financeService.create(stripeConfigData);
        res.stripeConfig = configCreated?._id?.toString();
        // create an access manager account
        await this.accountService.create({
          websiteKey:
            whitelabelAccount?.data?.signupSuperAdmin?.user?.builderDomain ||
            subdomainFallback,
          username: business?.accounts?.email?.email || user?.email,
          password: business?.accounts?.email?.password || user?.email,
          user: userId,
        });
      }
      return {
        user: userId,
        stripeConfig: res.stripeConfig,
        whitelabelAccount: whitelabelAccount,
        subdomain:
          whitelabelAccount?.data?.signupSuperAdmin?.user?.builderDomain ||
          subdomainFallback,
      };
    }
    // remove created user if exist since it's error
    if (userId) {
      await this.userService.remove(userId).catch((e) => console.error(e));
    }
    throw new InternalServerErrorException(
      'Failed to create whitelabel account',
    );
  }
  async update(id: string, updateBusinessDto: UpdateBusinessDto) {
    try {
      if (!updateBusinessDto) {
        throw new BadRequestException('Invalid request');
      }
      const business = await this.businessModel
        .findById(id)
        .populate('product')
        .populate({
          path: 'niche',
          model: Niche.name,
          populate: {
            path: 'productMockups',
            populate: [
              {
                path: 'mockups',
                model: File.name,
              },
              {
                path: 'mobileMockups',
                model: File.name,
              },
              {
                path: 'desktopMockups',
                model: File.name,
              },
            ],
          },
        })
        .populate(['logo', 'favicon', 'generatedGraphics', 'user']);
      const generateRequest = updateBusinessDto.generate;
      if (generateRequest) {
        // TODO required fields
        // create a new whitelabel account
        const generatedWhitelabel =
          await this.generateWhitelabelAccount(business);

        // create a new website in web.husl.app
        const generatedWebsite = await this.generateHuslWeb(business, {
          ...updateBusinessDto,
          productUrl: generatedWhitelabel?.subdomain,
        });
        if (generatedWhitelabel?.user) {
          updateBusinessDto.user = generatedWhitelabel?.user;
        }
        if (generatedWhitelabel?.stripeConfig) {
          updateBusinessDto.stripeConfig = generatedWhitelabel?.stripeConfig;
        }
        // update business
        updateBusinessDto.generated = !!generatedWebsite?.id;
      }
      delete updateBusinessDto?.generate;
      // if (updateBusinessDto?.users) {
      //   const users = business?.users?.map((v) => (v as any)?._id);
      //   const newUsers = updateBusinessDto?.users;
      //   const usersToAdd = newUsers.filter((user) => !users.includes(user));
      //   updateBusinessDto.users = [...users, ...usersToAdd];
      // }
      const updatedBusiness = business
        .updateOne(updateBusinessDto, {
          new: true,
        })
        .where('deleted', false);

      return updatedBusiness;
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id: string) {
    try {
      // update business to deleted
      const deletedBusiness = await this.businessModel.findByIdAndUpdate(
        id,
        { deleted: true },
        {
          new: true,
        },
      );
      return deletedBusiness;
    } catch (error) {
      throw new Error(error);
    }
  }

  async restore(id: string) {
    try {
      // update business to deleted
      const restored = await this.businessModel
        .findByIdAndUpdate(
          id,
          { deleted: false },
          {
            new: true,
          },
        )
        .where('deleted', true);
      return restored;
    } catch (error) {
      throw new Error(error);
    }
  }

  // get business by id
  async getBusinessById(id: string) {
    try {
      const business = await this.businessModel
        .findById(id)
        .populate('product')
        .populate({
          path: 'niche',
          model: 'niche',
          populate: {
            path: 'productMockups',
            populate: [
              {
                path: 'mockups',
                model: File.name,
              },
              {
                path: 'mobileMockups',
                model: File.name,
              },
              {
                path: 'desktopMockups',
                model: File.name,
              },
            ],
          },
        })
        .populate(['logo', 'favicon', 'generatedGraphics', 'user'])
        .select('-accounts');
      return business;
    } catch (error) {
      throw new Error(error);
    }
  }

  async countTotalData(query?: Record<string, any>) {
    try {
      const totalData = await this.businessModel.countDocuments(query).where({
        $or: [{ deleted: false }, { deleted: { $exists: false } }],
      });
      return totalData;
    } catch (error) {
      throw new Error(error);
    }
  }
}
