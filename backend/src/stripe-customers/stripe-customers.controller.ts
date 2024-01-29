import { Request, Response } from 'express';
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
  UseGuards,
} from '@nestjs/common';

import { CreateStripeCustomerDto } from './dto/create-stripe-customer.dto';
import { UpdateStripeCustomerDto } from './dto/update-stripe-customer.dto';
import { StripeCustomersService } from './stripe-customers.service';

@Controller('stripe-customers')
export class StripeCustomersController {
  constructor(
    private readonly stripeCustomersService: StripeCustomersService,
  ) {}

  @Post()
  create(@Body() createStripeCustomerDto: CreateStripeCustomerDto) {
    return this.stripeCustomersService.create(createStripeCustomerDto);
  }

  @Get()
  findAll() {
    return this.stripeCustomersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user-tag')
  async findStripeCustomerByTag(
    @Param('tag') tag: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;
      const userId = user?._id;

      const data = await this.stripeCustomersService.findOneByUserTag({
        userId: userId,
      });

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Stripe customer fetched successfully.',
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
  @Get('/user-tag/monthly')
  async findStripeMonthlyCustomerByTag(
    @Param('tag') tag: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;
      const userId = user?._id;

      const data = await this.stripeCustomersService.findMonthlyByUserTag({
        userId: userId,
      });

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Stripe customer fetched successfully.',
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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStripeCustomerDto: UpdateStripeCustomerDto,
  ) {
    return this.stripeCustomersService.update(+id, updateStripeCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stripeCustomersService.remove(+id);
  }
}
