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
  UnauthorizedException,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';

import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get('/public/:id')
  async publicGetBusinessById(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.businessesService.getBusinessById(id);

      return res.status(HttpStatus.OK).json({
        data,
        message: `Business with id ${id} found.`,
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
  @Post()
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;
      const userId = user?._id;
      // only admin can create niche
      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }
      const data = await this.businessesService.create({
        createdBy: userId,
        ...createBusinessDto,
      });

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Business added successfully.',
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
  @Get('overview')
  async getBusinessOverview(@Res() res: Response, @Req() req: Request) {
    try {
      const user: any = req?.user;
      const userId = user?._id;
      // if (user?.role !== 'admin') {
      //   throw new UnauthorizedException('Unauthorized');
      // }
      const data = await this.businessesService.businessOverview(userId);

      if (!data) {
        return res.status(HttpStatus.NOT_FOUND).json({
          data: null,
          message: `Business overview not found.`,
          status: HttpStatus.NOT_FOUND,
        });
      }
      return res.status(HttpStatus.OK).json({
        data,
        message: `Business overview found.`,
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
      // const user: any = req?.user;
      // const userId = user?._id;
      // if (user?.role !== 'admin') {
      //   throw new UnauthorizedException('Unauthorized');
      // }
      const query: Record<string, any> = {
        ...req?.query,
        // createdBy: userId,
      };
      if (req?.query?._q) {
        query.name = { $regex: req?.query?._q, $options: 'i' };
        delete query._q;
      }
      const metaQuery = removePaginateQuery(query);

      const data = await this.businessesService.findAll(query);
      const totalData = await this.businessesService.countTotalData(metaQuery);

      // create pagination object
      const limit = query?.limit;
      const meta = {
        page: Number(query?.page) || 1,
        pageCount: limit ? Math.ceil(totalData / limit) : 1,
        limit: limit ? Number(limit) : totalData,
        total: totalData,
      };

      return res.status(HttpStatus.OK).json({
        data,
        meta,
        message: 'Business found.',
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
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
    // @Req() req: Request,
  ) {
    try {
      // const user: any = req?.user;
      // const userId = user?._id;
      // if (user?.role !== 'admin') {
      //   throw new UnauthorizedException('Unauthorized');
      // }
      const data = await this.businessesService.findOne(id);

      if (!data) {
        return res.status(HttpStatus.NOT_FOUND).json({
          data: null,
          message: `Business with id ${id} not found.`,
          status: HttpStatus.NOT_FOUND,
        });
      }
      return res.status(HttpStatus.OK).json({
        data,
        message: `Business with id ${id} found.`,
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
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;
      if (user?.role !== 'admin') {
        // bypass for onboarding only
        if (updateBusinessDto?.onboardingCompleted) {
          const data = await this.businessesService.update(id, {
            onboardingCompleted: updateBusinessDto?.onboardingCompleted,
          });
          return res.status(HttpStatus.OK).json({
            data,
            message: `Business with id ${id} edited successfully.`,
            status: HttpStatus.OK,
          });
        }
        throw new UnauthorizedException('Unauthorized');
      }
      const data = await this.businessesService.update(id, updateBusinessDto);

      return res.status(HttpStatus.OK).json({
        data,
        message: `Business with id ${id} edited successfully.`,
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
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;

      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }
      const data = await this.businessesService.remove(id);

      return res.status(HttpStatus.OK).json({
        data,
        message: `Business with id ${id} deleted successfully.`,
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
  @Post('/restore/:id')
  async restore(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;

      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }
      const data = await this.businessesService.restore(id);

      return res.status(HttpStatus.OK).json({
        data,
        message: `Business with id ${id} restored successfully.`,
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
