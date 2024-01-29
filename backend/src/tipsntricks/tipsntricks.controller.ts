import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
  HttpStatus,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { TipsntrickService } from './tipsntricks.service';
import { CreateTipsntrickDto } from './dto/create-tipsntrick.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('tipsntricks')
export class TipsntrickController {
  constructor(private readonly tipsntrickService: TipsntrickService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createTipsntrickDto: CreateTipsntrickDto,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const user = req?.user;
      let userId = user?._id;
      if (user?.role === 'admin' && createTipsntrickDto?.user) {
        userId = createTipsntrickDto?.user;
      }
      const data = await this.tipsntrickService.create({
        user: userId,
        ...createTipsntrickDto,
      });

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Brand overview saved successfully.',
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
   * Get User Roadmap
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Res() res: Response, @Req() req) {
    try {
      const userId = req?.user?._id;
      const query = {
        ...req?.query,
        user: userId,
      };
      const data = await this.tipsntrickService.findAll(query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'User brand overview found.',
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
   * Get User Roadmap
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get('/user/:userId')
  async findAllByUserId(@Res() res: Response, @Req() req, @Param() params) {
    try {
      const user = req?.user;
      if (user?.role !== 'admin') {
        throw new UnauthorizedException(
          "You don't have permission to access this resource.",
        );
      }
      const userId = params?.userId;
      const query = {
        ...req?.query,
        user: userId,
      };
      const data = await this.tipsntrickService.findAll(query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'User brand overview found.',
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
