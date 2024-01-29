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
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';
import { GAnalyticsConfigService } from 'src/ga-configs/ga-configs.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly gAnalyticsService: GAnalyticsConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createSettingDto: CreateSettingDto,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const user = req?.user;
      // only admin can create settings
      if (user?.role !== 'admin') {
        throw new UnauthorizedException(
          'You are not authorized to perform this action.',
        );
      }
      const data = await this.settingsService.create(createSettingDto);

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Setting added successfully.',
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
  @Post('/ga-config')
  async createGAConfig(@Res() res: Response, @Req() req) {
    try {
      const user = req?.user;
      // only admin can create settings
      if (user?.role !== 'admin') {
        throw new UnauthorizedException(
          'You are not authorized to perform this action.',
        );
      }
      const data = await this.gAnalyticsService.getToken(req.body);

      await this.settingsService.create({
        key: 'ga-config',
        value: data,
      });

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Setting added successfully.',
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
  @Post('/ga-config/refresh')
  async refreshGAConfig(@Res() res: Response, @Req() req) {
    try {
      const user = req?.user;
      // only admin can create settings
      if (user?.role !== 'admin') {
        throw new UnauthorizedException(
          'You are not authorized to perform this action.',
        );
      }
      const data = await this.gAnalyticsService.refreshGAToken(req.body);

      await this.settingsService.update('ga-config', {
        value: data,
      });

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Setting added successfully.',
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
  async findAll(@Res() res: Response, @Req() req) {
    try {
      const query = req?.query;
      const data = await this.settingsService.findAll(query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'All settings found.',
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
  @Get(':key')
  async findOne(@Param('key') key: string, @Res() res: Response, @Req() req) {
    try {
      const query = req?.query;
      const data = await this.settingsService.findOne(key, query);
      return res.status(HttpStatus.OK).json({
        data,
        message: 'Setting found.',
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
  @Patch(':key')
  async update(
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const user = req?.user;
      // only admin can update settings
      if (user?.role !== 'admin') {
        throw new UnauthorizedException(
          'You are not authorized to perform this action.',
        );
      }
      const data = await this.settingsService.update(key, updateSettingDto);

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Setting updated successfully.',
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settingsService.remove(+id);
  }
}
