import { Request, Response } from 'express';
// import { UpdateGaConfigDto } from './dto/update-ga-config.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { CreateGaConfigDto } from './dto/create-ga-config.dto';
import { GAnalyticsConfigService } from './ga-configs.service';

@Controller('ganalytics')
export class GAnalyticsConfigController {
  constructor(private readonly gAnalyticsService: GAnalyticsConfigService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/config')
  async create(
    @Body() createGaConfigDto: CreateGaConfigDto,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const user = req?.user;
      let userId = user?._id;
      if (user?.role === 'admin' && createGaConfigDto?.user) {
        userId = createGaConfigDto?.user;
      }
      const body = {
        user: userId,
        createdBy: userId,
        ...createGaConfigDto,
      };
      const data = await this.gAnalyticsService.create(body);

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Google Analytics config saved successfully.',
        status: HttpStatus.CREATED,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Get User Config
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('/config/auth')
  async authGAToken(@Res() res: Response, @Req() req) {
    try {
      const user = req?.user;
      const body = {
        ...req?.body,
        user,
      };
      const data = await this.gAnalyticsService.getToken(body);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'User GA token.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Get User Config
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('/config/refresh-token')
  async refreshGAToken(@Res() res: Response, @Req() req) {
    try {
      const userId = req?.user?._id;
      const body = {
        ...req?.body,
        user: userId,
      };
      const data = await this.gAnalyticsService.refreshGAToken(body);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'User GA token refreshed.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Get User Config
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get('/config')
  async findConfig(@Res() res: Response, @Req() req) {
    try {
      const userId = req?.user?._id;
      const query = {
        ...req?.query,
        user: userId,
      };
      const data = await this.gAnalyticsService.findConfig(query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'User GA Config found.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Only works for admin to get user config
   * @param res
   * @param req
   * @param params
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get('/config/:userId')
  async findOneById(@Res() res: Response, @Req() req, @Param() params) {
    try {
      const user = req?.user;
      if (user?.role !== 'admin') {
        throw new UnauthorizedException(
          "You don't have permission to access this resource.",
        );
      }
      const userId = params?.userId;

      const data = await this.gAnalyticsService.findConfig({
        user: userId,
      });

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'GA Config found.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/pageviews')
  async getPageViews(
    @Res() res: Response,
    @Req() req: Request,
    @Headers('ga_refresh_token') ga_token,
  ) {
    try {
      const userId = (req?.user as any)?._id;
      const token = req?.query?.token || ga_token;
      const query = {
        ...req?.query,
        user: userId,
      };
      const data = await this.gAnalyticsService.getPageViews(
        query,
        token?.toString(),
      );
      return res.status(HttpStatus.OK).json({
        data,
        message: 'Page views analytics found.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/browsers')
  async getBrowsers(
    @Res() res: Response,
    @Req() req: Request,
    @Headers('ga_refresh_token') ga_token,
  ) {
    try {
      const userId = (req?.user as any)?._id;
      const token = req?.query?.token || ga_token;
      const query = {
        ...req?.query,
        user: userId,
      };
      const data = await this.gAnalyticsService.getBrowsers(
        query,
        token?.toString(),
      );

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Analytics browsers found.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @Get()
  findAll() {
    return this.gAnalyticsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gAnalyticsService.findOne(+id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateGaConfigDto: UpdateGaConfigDto,
  // ) {
  //   return this.gAnalyticsService.update(+id, updateGaConfigDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gAnalyticsService.remove(+id);
  }
}
