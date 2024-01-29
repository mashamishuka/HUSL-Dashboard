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

import { CreateOnboardingProgressDto } from './dto/create-onboarding-progress.dto';
import { UpdateOnboardingProgressDto } from './dto/update-onboarding-progress.dto';
import { OnboardingProgressesService } from './onboarding-progresses.service';

@Controller('onboarding-progresses')
export class OnboardingProgressesController {
  constructor(
    private readonly onboardingProgressesService: OnboardingProgressesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async saveProgress(
    @Body() createOnboardingProgressDto: CreateOnboardingProgressDto,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      if (
        !createOnboardingProgressDto?.business ||
        !createOnboardingProgressDto?.onboarding
      ) {
        throw new Error('Business and onboarding are required.');
      }
      const user: any = req?.user;
      const userId = user?._id;
      const progress = await this.onboardingProgressesService.saveProgress({
        ...createOnboardingProgressDto,
        user: userId,
      });
      return res.status(HttpStatus.CREATED).json({
        data: progress,
        message: 'Onboarding progress created.',
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

      const query = {
        ...req?.query,
        user: userId,
      };
      const data = await this.onboardingProgressesService.findAll(query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Onboarding progress found.',
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
    return this.onboardingProgressesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOnboardingProgressDto: UpdateOnboardingProgressDto,
  ) {
    return this.onboardingProgressesService.update(
      +id,
      updateOnboardingProgressDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.onboardingProgressesService.remove(+id);
  }
}
