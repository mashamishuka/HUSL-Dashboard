import { OAuth2Client, UserRefreshClient } from 'google-auth-library';
import api from 'helpers/api';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';

import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateGaConfigDto } from './dto/create-ga-config.dto';
// import { UpdateGaConfigDto } from './dto/update-ga-config.dto';
import { GAnalyticConfig } from './ga-configs.schema';

@Injectable()
export class GAnalyticsConfigService {
  private CLIENT_ID = '';
  private CLIENT_SECRET = '';
  constructor(
    @InjectModel(GAnalyticConfig.name) private GAModel: Model<GAnalyticConfig>,
    private userService: UsersService,
  ) {
    this.CLIENT_ID =
      process.env.GOOGLE_CLIENT_KEY ||
      '203773490656-rqtktrlr2bp0lu49ntkgvrtj6rc1p4s0.apps.googleusercontent.com';
    this.CLIENT_SECRET =
      process.env.GOOGLE_CLIENT_SECRET || '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';
    // this.CLIENT_ID =
    //   '78022972379-d0d46rsefmq9srmbb4rqo0dc9n5doeg0.apps.googleusercontent.com';
    // this.CLIENT_SECRET = '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';
  }
  /**
   * Create user GA Config
   * @param createGaConfigDto
   * @returns
   */
  async create(createGaConfigDto: CreateGaConfigDto) {
    try {
      const user = await this.userService.findOne(createGaConfigDto?.user);
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      // create or update the roadmap
      const roadmap = await this.GAModel.findOneAndUpdate(
        {
          user: user._id,
        },
        {
          ...createGaConfigDto,
        },
        {
          upsert: true,
          new: true,
        },
      );
      return roadmap;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get user GA Config
   * @param query
   * @returns
   */
  async findConfig(query?: Record<string, any>) {
    try {
      const data = await this.GAModel.findOne(query);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get GA Token
   */
  async getToken(body?: Record<string, any>) {
    try {
      if (!body?.code) {
        throw new HttpException('Code not found', 404);
      }
      const oAuth2Client = new OAuth2Client(
        this.CLIENT_ID,
        this.CLIENT_SECRET,
        'postmessage',
      );
      const { tokens } = await oAuth2Client.getToken(body?.code);
      // fetch all gaConfig bellow this account
      // if it's admin, we should create a config to all accounts bellow this admin
      if (body?.user?.role === 'admin') {
        await this.GAModel.updateMany(
          {
            createdBy: body?.user?._id,
          },
          {
            gaToken: tokens?.refresh_token,
          },
        );
      } else {
        await this.GAModel.updateOne(
          {
            user: body?.user?._id,
          },
          {
            gaToken: tokens?.refresh_token,
          },
        );
      }
      return tokens;
    } catch (error) {
      throw new Error(error);
    }
  }
  /**
   * Refresh token
   */
  async refreshGAToken(body?: Record<string, any>) {
    try {
      if (!body?.refreshToken) {
        throw new HttpException('Refresh token not found', 404);
      }
      const user = new UserRefreshClient(
        this.CLIENT_ID,
        this.CLIENT_SECRET,
        body.refreshToken,
      );
      const { credentials } = await user.refreshAccessToken();
      return credentials;
    } catch (error) {
      throw new Error(error);
    }
  }
  /**
   * Get saved GA data
   */
  private async getSavedData(configId: any, field?: 'pageViews' | 'browser') {
    try {
      const gaConfig = await this.findConfig({
        _id: configId,
      });
      if (!gaConfig) {
        throw new HttpException('Google Analytics config not found', 404);
      }
      if (gaConfig?.pageViews || gaConfig?.browser) {
        const data = gaConfig?.[field];
        return data;
      }
      return null;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Save GA data
   */
  private async saveGAData(
    configId: any,
    field?: 'pageViews' | 'browser',
    data?: any,
  ) {
    try {
      const gaConfig = await this.findConfig({
        _id: configId,
      });
      if (!gaConfig) {
        throw new HttpException('Google Analytics config not found', 404);
      }
      return gaConfig.updateOne({
        [field]: data,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get Analytics Page Views
   */
  async getPageViews(query?: Record<string, any>, token?: string) {
    try {
      const gaConfig = await this.findConfig({
        user: query?.user,
      });
      if (!gaConfig) {
        throw new HttpException('Google Analytics config not found', 404);
      }
      if (!token) {
        const savedData = await this.getSavedData(
          gaConfig?._id,
          'pageViews',
        ).then((res) => {
          const propertyId = res?.propertyId;
          const data = res?.data;
          return propertyId === gaConfig?.propertyId ? data : null;
        });
        const pageViews = savedData?.rows?.map((view) => ({
          label: parseInt(view?.dimensionValues?.[0]?.value) - 1,
          value: view?.metricValues?.[0]?.value,
        }));
        if (pageViews) {
          return pageViews;
        } else {
          throw new HttpException('Google 0auth token required.', 404);
        }
      }

      const reportType = query?.reportType || 'this_year';
      let dateRanges = [
        moment().startOf('year').format('YYYY-MM-DD'),
        moment().format('YYYY-MM-DD'),
      ];
      let dimension = 'month';
      switch (reportType) {
        case 'this_month':
          dateRanges = [
            moment().startOf('month').format('YYYY-MM-DD'),
            moment().format('YYYY-MM-DD'),
          ];
          dimension = 'day';
          break;
        case 'last_month':
          dateRanges = [
            moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
            moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
          ];
          dimension = 'day';
          break;
        case 'last_year':
          dateRanges = [
            moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
            moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
          ];
          dimension = 'month';
          break;
        case 'last_week':
          dateRanges = [
            moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD'),
            moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD'),
          ];
          dimension = 'day';
          break;
        case 'this_week':
          dateRanges = [
            moment().startOf('week').format('YYYY-MM-DD'),
            moment().format('YYYY-MM-DD'),
          ];
          dimension = 'day';
          break;
        default:
          break;
      }

      const user = new UserRefreshClient(
        this.CLIENT_ID,
        this.CLIENT_SECRET,
        token,
      );
      const gaData = await user
        .refreshAccessToken()
        .then((data) => data)
        .catch((e) => {
          console.log(e);
          return null;
        });
      const credentials = gaData?.credentials;
      const access_token = credentials?.access_token;
      // if (!access_token) {
      //   throw new HttpException('Google 0auth token invalid.', 404);
      // }

      let cacheData = false;
      const reports = await api
        .post(
          `https://analyticsdata.googleapis.com/v1beta/properties/${gaConfig?.propertyId}:runReport`,
          {
            dateRanges: [
              {
                startDate: dateRanges[0],
                endDate: dateRanges[1],
              },
            ],
            metrics: [
              {
                expression: 'screenPageViews',
                name: 'ga:pageviews',
              },
            ],
            dimensions: [
              {
                name: dimension,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        )
        .then(({ data }) => data)
        .catch((e) => {
          console.error(e);
          cacheData = true;
          // get saved data
          return this.getSavedData(gaConfig?._id, 'pageViews').then((res) => {
            const propertyId = res?.propertyId;
            const data = res?.data;
            return propertyId === gaConfig?.propertyId ? data : null;
          });
        });

      const pageViews = reports?.rows?.map((view) => ({
        label: parseInt(view?.dimensionValues?.[0]?.value) - 1,
        value: view?.metricValues?.[0]?.value,
      }));
      // sort label by ascending
      pageViews?.sort((a, b) => a.label - b.label);

      if (reports && !cacheData) {
        await this.saveGAData(gaConfig?._id, 'pageViews', {
          data: reports,
          lastUpdatedAt: new Date(),
          propertyId: gaConfig?.propertyId,
        });
      }
      return pageViews;
    } catch (error) {
      throw new Error(error);
    }
  }
  /**
   * Get analytics devices data
   * @returns
   */
  async getBrowsers(query?: Record<string, any>, token?: string) {
    try {
      const gaConfig = await this.findConfig({
        user: query?.user,
      });
      if (!gaConfig) {
        throw new HttpException('Google Analytics config not found', 404);
      }
      if (!token) {
        const savedData = await this.getSavedData(
          gaConfig?._id,
          'browser',
        ).then((res) => {
          const propertyId = res?.propertyId;
          const data = res?.data;
          return propertyId === gaConfig?.propertyId ? data : null;
        });
        const devices = savedData?.rows?.map((device) => ({
          device: device?.dimensionValues?.[0]?.value,
          sessions: device?.metricValues?.[0]?.value,
        }));
        if (devices) {
          return devices;
        }

        throw new HttpException('Google 0auth token required.', 404);
      }

      // const analyticsreporting = google.analyticsreporting('v4');
      // google.options({
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // const reports = await analyticsreporting.reports.batchGet({
      //   requestBody: {
      //     reportRequests: [
      //       {
      //         viewId: gaConfig?.propertyId,
      //         dimensions: [
      //           {
      //             name: 'ga:browser',
      //           },
      //         ],
      //       },
      //     ],
      //   },
      // });
      // const devices = reports?.data?.reports[0]?.data?.rows?.map((device) => ({
      //   device: device?.dimensions?.[0],
      //   sessions: device?.metrics?.[0]?.values[0],
      // }));
      const user = new UserRefreshClient(
        this.CLIENT_ID,
        this.CLIENT_SECRET,
        token,
      );
      const gaData = await user
        .refreshAccessToken()
        .then((data) => data)
        .catch(() => null);

      const credentials = gaData?.credentials;
      const access_token = credentials?.access_token;

      // if (!access_token) {
      //   throw new HttpException('Google 0auth token invalid.', 404);
      // }
      let cacheData = false;
      const reports = await api
        .post(
          `https://analyticsdata.googleapis.com/v1beta/properties/${gaConfig?.propertyId}:runReport`,
          {
            dateRanges: [
              {
                startDate: moment().subtract(1, 'year').format('YYYY-MM-DD'),
                endDate: 'today',
              },
            ],
            dimensions: [
              {
                name: 'browser',
              },
            ],
            metrics: [
              {
                expression: 'screenPageViews',
                name: 'ga:pageviews',
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        )
        .then(({ data }) => data)
        .catch((e) => {
          console.error(e);
          cacheData = true;
          // get saved data
          return this.getSavedData(gaConfig?._id, 'browser').then((res) => {
            const propertyId = res?.propertyId;
            const data = res?.data;
            return propertyId === gaConfig?.propertyId ? data : null;
          });
        });
      const devices = reports?.rows?.map((device) => ({
        device: device?.dimensionValues?.[0]?.value,
        sessions: device?.metricValues?.[0]?.value,
      }));
      if (reports && !cacheData) {
        await this.saveGAData(gaConfig?._id, 'browser', {
          data: reports,
          lastUpdatedAt: new Date(),
          propertyId: gaConfig?.propertyId,
        });
      }
      return devices;
    } catch (error) {
      throw new Error(error);
    }
  }
  async findAll() {
    return 'This action adds a new gaConfig';
  }

  findOne(id: number) {
    return `This action returns a #${id} gaConfig`;
  }

  update(id: number) {
    return `This action updates a #${id} gaConfig`;
  }

  remove(id: number) {
    return `This action removes a #${id} gaConfig`;
  }
}
