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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { CreateGraphicTemplateDto } from './dto/create-graphic-template.dto';
import { UpdateGraphicTemplateDto } from './dto/update-graphic-template.dto';
import { GraphicTemplatesService } from './graphic-templates.service';

@Controller('graphic-templates')
export class GraphicTemplatesController {
  constructor(
    private readonly graphicTemplatesService: GraphicTemplatesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createGraphicTemplateDto: CreateGraphicTemplateDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user = req?.user as any;
      const userId = user?._id;
      // create or update a graphic template should be only for admin
      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized access.');
      }
      const body = {
        createdBy: userId,
        ...createGraphicTemplateDto,
      };
      const data = await this.graphicTemplatesService.create(body);

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Graphic template created successfully.',
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
      const user = req?.user as any;
      // get a graphic template should be only for admin
      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized access.');
      }
      const data = await this.graphicTemplatesService.findAll();

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Graphic templates fetched successfully.',
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
      const user = req?.user as any;
      // get a graphic template should be only for admin
      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized access.');
      }
      const data = await this.graphicTemplatesService.findOne(id);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Graphic template fetched successfully.',
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
    @Body() updateGraphicTemplateDto: UpdateGraphicTemplateDto,
  ) {
    return this.graphicTemplatesService.update(+id, updateGraphicTemplateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user = req?.user as any;
      // create or update a graphic template should be only for admin
      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized access.');
      }
      const data = await this.graphicTemplatesService.remove(id);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Graphic template deleted successfully.',
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
