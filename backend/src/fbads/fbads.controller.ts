import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { CreateFbadDto } from './dto/create-fbad.dto';
import { FbadsService } from './fbads.service';

@Controller('fbads')
export class FbadsController {
  constructor(private readonly fbadsService: FbadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/config')
  async createConfig(
    @Body() createFbadDto: CreateFbadDto,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const user = req?.user;
      let userId = user?._id;
      if (user?.role === 'admin' && createFbadDto?.user) {
        userId = createFbadDto?.user;
      }
      const body = {
        user: userId,
        ...createFbadDto,
      };
      const data = await this.fbadsService.createConfig(body);

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'FB Ads Config saved successfully.',
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

  @UseGuards(JwtAuthGuard)
  @Get('/config')
  async findOne(@Res() res: Response, @Req() req) {
    try {
      const userId = req?.user?._id;
      const data = await this.fbadsService.findOne(userId);

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'FB Ads Config found.',
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

      const data = await this.fbadsService.findOne(userId);

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'FB Ads Config found.',
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
  @Get('campaigns')
  async getCampaigns(@Res() res: Response, @Req() req: Request) {
    try {
      const userId = (req?.user as any)?._id;
      const data = await this.fbadsService.getCampaigns(userId, req?.query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'FB Ads campaigns found.',
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
  @Post('campaigns')
  async createCampaigns(
    @Res() res: Response,
    @Req() req: Request,
    @Body() body,
  ) {
    try {
      const userId = (req?.user as any)?._id;
      const data = await this.fbadsService.createCampaign(
        userId,
        body,
        req?.query,
      );

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Campaign created succesfully.',
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
  @Get('/campaigns/:id')
  async getCampaignById(
    @Param() params: Record<string, any>,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const userId = (req?.user as any)?._id;
      const data = await this.fbadsService.getCampaignById(
        userId,
        params?.id,
        req?.query,
      );

      return res.status(HttpStatus.OK).json({
        data,
        message: 'FB Ads campaigns found.',
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
  @Get('isTokenValid')
  async checkToken(@Res() res: Response, @Req() req: Request) {
    try {
      const userId = (req?.user as any)?._id;
      const data = await this.fbadsService.checkToken(userId);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'FB Ads token fetched.',
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
  @Patch('campaigns/:id')
  async updateCampaigns(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    try {
      const userId = (req?.user as any)?._id;
      const data = await this.fbadsService.updateCampaign(
        userId,
        id,
        req?.body,
      );

      return res.status(HttpStatus.OK).json({
        data,
        message: 'FB Ads campaigns updated.',
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
  @Get('adsets')
  async getAdSets(@Res() res: Response, @Req() req: Request) {
    try {
      const userId = (req?.user as any)?._id;
      const data = await this.fbadsService.getAdSets(userId, req?.query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'FB Ads adsets found.',
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
  @Patch('adsets/:id')
  async updateAdSets(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    try {
      const userId = (req?.user as any)?._id;
      const data = await this.fbadsService.updateAdSet(userId, id, req?.body);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'FB Ads AdSet updated.',
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
  @Get('ads')
  async getAds(@Res() res: Response, @Req() req: Request) {
    try {
      const userId = (req?.user as any)?._id;
      const data = await this.fbadsService.getAds(userId, req?.query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'FB Ads Ad found.',
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
  @Patch('ads/:id')
  async updateAds(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    try {
      const userId = (req?.user as any)?._id;
      const data = await this.fbadsService.updateAd(userId, id, req?.body);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'FB Ads Ads updated.',
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
  @Get('cpc')
  async getCPC(@Res() res: Response, @Req() req: Request) {
    try {
      const userId = (req?.user as any)?._id;
      const data = await this.fbadsService.getFbAdsCPC(userId, req?.query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'FB Ads Insights found.',
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
}
