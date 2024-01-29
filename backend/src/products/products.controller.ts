import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request, Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;
      const userId = user?._id;
      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }
      const data = await this.productsService.create({
        createdBy: userId,
        ...createProductDto,
      });

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Product added successfully.',
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
      const query = {
        ...req?.query,
        user: userId,
      };
      const data = await this.productsService.findAll(query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Products found.',
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
      const data = await this.productsService.findOne(id);

      if (!data) {
        return res.status(HttpStatus.NOT_FOUND).json({
          data: null,
          message: `Product with id ${id} not found.`,
          status: HttpStatus.NOT_FOUND,
        });
      }
      return res.status(HttpStatus.OK).json({
        data,
        message: `Product with id ${id} found.`,
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
    @Body() updateProductDto: UpdateProductDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;

      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }
      const data = await this.productsService.update(id, updateProductDto);

      return res.status(HttpStatus.OK).json({
        data,
        message: `Product with id ${id} edited successfully.`,
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
      const data = await this.productsService.remove(id);

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
