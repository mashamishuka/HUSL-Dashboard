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
  UnauthorizedException,
} from '@nestjs/common';
import { OnboardingsService } from './onboardings.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('onboardings')
export class OnboardingsController {
  constructor(private readonly onboardingsService: OnboardingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createOnboardingDto: CreateOnboardingDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;
      if (user?.role !== 'admin') {
        throw new UnauthorizedException(
          'You are not authorized to perform this action.',
        );
      }
      const data = await this.onboardingsService.create(createOnboardingDto);

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Onboarding item created successfully.',
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
      const query = req?.query;
      const data = await this.onboardingsService.findAll(query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Onboarding found.',
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
  @Patch('/order')
  async updateOrder(
    @Body()
    body: {
      order: string[];
    },
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;
      if (user?.role !== 'admin') {
        throw new UnauthorizedException(
          'You are not authorized to perform this action.',
        );
      }
      const data = await this.onboardingsService.updateOrder(body.order);

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Onboarding item order updated.',
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

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const query = req?.query;
      const data = await this.onboardingsService.findOne(id, query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Onboarding found.',
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
    @Body() updateOnboardingDto: UpdateOnboardingDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.onboardingsService.update(
        id,
        updateOnboardingDto,
      );

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Onboarding edited successfully.',
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
        throw new UnauthorizedException(
          'You are not authorized to perform this action.',
        );
      }
      const data = await this.onboardingsService.remove(id);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Onboarding item order deleted.',
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
