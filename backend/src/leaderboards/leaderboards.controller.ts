import { Request, Response } from 'express';
import { removePaginateQuery } from 'helpers/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';

import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { LeaderboardsService } from './leaderboards.service';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/revenue/trigger')
  async triggerRevenueLeaderboardUpdate(
    @Body() createLeaderboardDto: CreateLeaderboardDto,
    @Res() res: Response,
  ) {
    try {
      const leaderboard = await this.leaderboardsService.triggerRevenueUpdate();
      return res.status(HttpStatus.OK).json({
        data: leaderboard,
        message: 'Leaderboards found.',
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
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    try {
      const query = {
        ...req?.query,
      };
      const metaQuery = removePaginateQuery(query);
      const data = await this.leaderboardsService.findAll(query);
      const totalData =
        await this.leaderboardsService.countTotalData(metaQuery);

      // create pagination object
      const limit = Number(query?.limit || '20');
      const meta = {
        page: Number(query?.page || 0) || 1,
        pageCount: Math.ceil((totalData || 0) / limit || 0),
        limit: limit,
        total: totalData,
      };

      return res.status(HttpStatus.OK).json({
        data,
        meta,
        message: 'Leaderboards found.',
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
  @Get('/gross-revenue')
  async getGrossGenerateRevenue(@Res() res: Response, @Req() req: Request) {
    try {
      const query = {
        ...req?.query,
      };
      const data =
        await this.leaderboardsService.getLeaderboardGrossGeneratedRevenue(
          query,
        );

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Leaderboards found.',
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
  @Get('/gross-revenue/highest')
  async getHighestGrossGenerateRevenue(
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const query = {
        ...req?.query,
      };
      const data =
        await this.leaderboardsService.getLeaderboardHighestGrossGeneratedRevenue(
          query,
        );

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Leaderboards found.',
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
  @Get('/influence')
  async getMineInfluence(@Res() res: Response, @Req() req: Request) {
    try {
      const userId = (req?.user as any)?._id;
      const data = await this.leaderboardsService.getUserFollowers(userId);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'User influence found.',
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaderboardsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.leaderboardsService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaderboardsService.remove(+id);
  }
}
