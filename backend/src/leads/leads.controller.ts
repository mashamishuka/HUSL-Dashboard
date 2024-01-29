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
  BadRequestException,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request, Response } from 'express';
import { removePaginateQuery } from 'helpers/common';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:nicheId/import')
  async importLeads(
    @Param('nicheId') nicheId: string,
    @Body() body: CreateLeadDto[],
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user: any = req?.user;
      // only admin can create niche
      if (user?.role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }
      const data = await this.leadsService.importLeads(nicheId, body);

      return res.status(HttpStatus.CREATED).json({
        data,
        message: 'Leads imported successfully.',
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
      const query: Record<string, any> = {
        ...req?.query,
        // mongoose search name like query
      };
      if (req?.query?._q) {
        // search by name or phone or email
        query.$or = [
          { name: { $regex: req?.query?._q, $options: 'i' } },
          { phone: { $regex: req?.query?._q, $options: 'i' } },
          { email: { $regex: req?.query?._q, $options: 'i' } },
        ];
        delete query._q;
      }
      const metaQuery = removePaginateQuery(query);

      const data = await this.leadsService.findAll(query);
      const totalData = await this.leadsService.countTotalData(metaQuery);

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
        message: 'Leads found.',
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
    return this.leadsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/notes')
  addNotes(
    @Param('id') id: string,
    @Body()
    body: {
      content: string;
    },
    @Res() res: Response,
  ) {
    try {
      if (!body?.content) {
        throw new BadRequestException('Content is required');
      }
      const data = this.leadsService.addNotes(id, body.content);
      return res.status(HttpStatus.OK).json({
        data,
        message: 'Leads notes added.',
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
  update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @Res() res: Response,
    // @Req() req: Request,
  ) {
    try {
      // const user: any = req?.user;
      // if (user?.role !== 'admin') {
      //   throw new UnauthorizedException('Unauthorized');
      // }
      const data = this.leadsService.update(id, updateLeadDto);
      return res.status(HttpStatus.OK).json({
        data,
        message: 'Leads updated.',
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(+id);
  }
}
