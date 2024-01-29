import { google } from 'googleapis';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { GAnalyticConfig } from 'src/ga-configs/ga-configs.schema';
import { UsersService } from 'src/users/users.service';

import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateGaConfigDto } from './dto/create-ga-config.dto';
import { UpdateGaConfigDto } from './dto/update-ga-config.dto';
import { GAnalytic } from './ganalytics.schema';

@Injectable()
export class GAnalyticsService {
  constructor(
    @InjectModel(GAnalyticConfig.name) private GAModel: Model<GAnalytic>,
    private userService: UsersService,
  ) {}
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
        throw new HttpException('Google 0auth token required.', 404);
      }

      const analyticsreporting = google.analyticsreporting('v4');
      google.options({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const reports = await analyticsreporting.reports.batchGet({
        requestBody: {
          reportRequests: [
            {
              viewId: gaConfig?.viewId,
              dateRanges: [
                {
                  startDate: moment().subtract(1, 'year').format('YYYY-MM-DD'),
                  endDate: 'today',
                },
              ],
              dimensions: [
                {
                  name: 'ga:week',
                },
              ],
              metrics: [
                {
                  expression: 'ga:pageviews',
                },
              ],
            },
          ],
        },
      });
      const pageViews = reports?.data?.reports[0]?.data?.rows?.map((view) => ({
        month: parseInt(view?.dimensions?.[0]) - 1,
        monthShort: moment.monthsShort(parseInt(view?.dimensions?.[0]) - 1),
        pageViews: view?.metrics?.[0]?.values[0],
      }));
      return { pageViews, reports };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get Analytics Page Views Counts
   */
  async getPageViewsCount(query?: Record<string, any>, token?: string) {
    try {
      const gaConfig = await this.findConfig({
        user: query?.user,
      });
      if (!gaConfig) {
        throw new HttpException('Google Analytics config not found', 404);
      }
      if (!token) {
        throw new HttpException('Google 0auth token required.', 404);
      }

      const analyticsreporting = google.analyticsreporting('v4');
      google.options({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const reports = await analyticsreporting.reports.batchGet({
        requestBody: {
          reportRequests: [
            {
              viewId: gaConfig?.viewId,
              dateRanges: [
                {
                  startDate: moment().subtract(1, 'year').format('YYYY-MM-DD'),
                  endDate: 'today',
                },
              ],
              dimensions: [
                {
                  name: 'ga:month',
                },
              ],
              metrics: [
                {
                  expression: 'ga:pageviews',
                },
              ],
            },
          ],
        },
      });
      // return only total page views
      const pageViews = reports?.data?.reports[0]?.data?.rows?.reduce(
        (acc, view) => {
          return acc + parseInt(view?.metrics?.[0]?.values[0]);
        },
        0,
      );
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
        throw new HttpException('Google 0auth token required.', 404);
      }

      const analyticsreporting = google.analyticsreporting('v4');
      google.options({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const reports = await analyticsreporting.reports.batchGet({
        requestBody: {
          reportRequests: [
            {
              viewId: gaConfig?.viewId,
              dimensions: [
                {
                  name: 'ga:browser',
                },
              ],
            },
          ],
        },
      });
      const devices = reports?.data?.reports[0]?.data?.rows?.map((device) => ({
        device: device?.dimensions?.[0],
        sessions: device?.metrics?.[0]?.values[0],
      }));
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

  update(id: number, updateGaConfigDto: UpdateGaConfigDto) {
    return `This action updates a #${id} gaConfig`;
  }

  remove(id: number) {
    return `This action removes a #${id} gaConfig`;
  }
}
