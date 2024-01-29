import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { CreateEmailConfigDto } from './dto/create-husl-mails.dto';
import { HuslMailsService } from './husl-mails.service';

@Controller('husl-mails')
export class HuslMailController {
  constructor(private readonly huslMailService: HuslMailsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/config')
  async createConfig(
    @Body() createEmailConfigDto: CreateEmailConfigDto,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const user: any = req?.user;
      let userId = user?._id;
      if (user?.role === 'admin' && createEmailConfigDto?.user) {
        userId = createEmailConfigDto?.user;
      }
      const data = await this.huslMailService.createConfig({
        user: userId,
        ...createEmailConfigDto,
      });

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'HUSL Email Config saved successfully.',
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
  async getConfig(@Res() res: Response, @Req() req) {
    try {
      const userId = req?.user?._id;
      const data = await this.huslMailService.getPublicEmailConfig(userId);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'HUSL Email Config found.',
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
  @Get('/config/:userId')
  async getConfigByUserId(@Res() res: Response, @Req() req, @Param() params) {
    try {
      const user = req?.user as any;
      if (user?.role !== 'admin') {
        throw new UnauthorizedException(
          "You don't have permission to access this resource.",
        );
      }
      const userId = params?.userId;
      const data = await this.huslMailService.getPublicEmailConfig(userId);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'HUSL Email Config found.',
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
  @Get('/campaigns')
  async getEmailCampaigns(@Res() res: Response, @Req() req) {
    try {
      const userId = req?.user?._id;
      const data = await this.huslMailService.getMailCampaigns(userId);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'HUSL Mail campaigns found.',
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
