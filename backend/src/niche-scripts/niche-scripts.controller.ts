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

import { CreateNicheScriptDto } from './dto/create-niche-script.dto';
import { UpdateNicheScriptDto } from './dto/update-niche-script.dto';
import { NicheScriptsService } from './niche-scripts.service';

@Controller('niche-scripts')
export class NicheScriptsController {
  constructor(private readonly nicheScriptsService: NicheScriptsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createNicheScriptDto: CreateNicheScriptDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;
      // only admin can create niche
      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }
      const data = await this.nicheScriptsService.create(createNicheScriptDto);

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Scripts added successfully.',
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
  @Get(':nicheId')
  async findAll(
    @Param('nicheId') nicheId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      // const user: any = req?.user;
      // only admin can create niche
      // if (user?.role !== 'admin') {
      //   throw new UnauthorizedException('Unauthorized');
      // }
      const query = {
        ...req?.query,
        niche: nicheId,
      };
      const data = await this.nicheScriptsService.findAll(query);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Scripts found.',
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
    return this.nicheScriptsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNicheScriptDto: UpdateNicheScriptDto,
  ) {
    return this.nicheScriptsService.update(+id, updateNicheScriptDto);
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
      // only admin can delete niche scripts
      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }
      const data = await this.nicheScriptsService.remove(id);

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Script deleted.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      throw new Error(error);
    }
  }
}
