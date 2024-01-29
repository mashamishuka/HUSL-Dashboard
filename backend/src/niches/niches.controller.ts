import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { NichesService } from './niches.service';
import { CreateNicheDto } from './dto/create-niche.dto';
import { UpdateNicheDto } from './dto/update-niche.dto';
import { UseGuards } from '@nestjs/common/decorators';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response, Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { removePaginateQuery } from 'helpers/common';

@Controller('niches')
export class NichesController {
  constructor(private readonly nichesService: NichesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createNicheDto: CreateNicheDto,
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
      const data = await this.nichesService.create({
        createdBy: userId,
        ...createNicheDto,
      });

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Niche added successfully.',
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
  @Get()
  async findAll(@Res() res: Response, @Req() req: Request) {
    try {
      const user: any = req?.user;
      const userId = user?._id;
      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }
      const query: Record<string, any> = {
        ...req?.query,
        // mongoose search name like query
        user: userId,
      };
      if (req?.query?._q) {
        query.name = { $regex: req?.query?._q, $options: 'i' };
        delete query._q;
      }
      const metaQuery = removePaginateQuery(query);

      const data = await this.nichesService.findAll(query);
      const totalData = await this.nichesService.countTotalData(metaQuery);

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
        message: 'Niche found.',
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
  @Get('/:id/businesses')
  async getBusinessInNicheCount(@Res() res: Response, @Param('id') id: string) {
    try {
      const data = await this.nichesService.getBusinessInNiche(id);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Business in niche found.',
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
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;
      // const userId = user?._id;
      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }
      // const query = {
      //   ...req?.query,
      //   user: userId,
      // };
      const data = await this.nichesService.findOne(id);

      if (!data) {
        return res.status(HttpStatus.NOT_FOUND).json({
          data: null,
          message: `Niche with id ${id} not found.`,
          status: HttpStatus.NOT_FOUND,
        });
      }
      return res.status(HttpStatus.OK).json({
        data,
        message: `Niche with id ${id} found.`,
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
    @Body() updateNicheDto: UpdateNicheDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;

      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }
      const data = await this.nichesService.update(id, updateNicheDto);

      return res.status(HttpStatus.OK).json({
        data,
        message: `Niche with id ${id} edited successfully.`,
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
      const data = await this.nichesService.remove(id);

      return res.status(HttpStatus.OK).json({
        data,
        message: `Product with id ${id} deleted successfully.`,
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
