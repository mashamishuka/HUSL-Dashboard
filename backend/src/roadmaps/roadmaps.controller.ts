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
import { RoadmapsService } from './roadmaps.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createRoadmapDto: CreateRoadmapDto,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const user = req?.user;
      let userId = user?._id;
      if (user?.role === 'admin' && createRoadmapDto?.user) {
        userId = createRoadmapDto?.user;
      }
      const data = await this.roadmapsService.create({
        user: userId,
        ...createRoadmapDto,
      });

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Roadmap saved successfully.',
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
      const data = await this.roadmapsService.findAll(query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'User roadmap found.',
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
      const data = await this.roadmapsService.findAll(query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'User roadmap found.',
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
