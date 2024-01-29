import { Response } from 'express';
import wrap_call_handler from 'helpers/wrap_call_handler';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/edit-member.dto';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add-member')
  create(
    @Body() createTeamDto: AddMemberDto,
    @Request() req,
    @Res() res: Response,
  ) {
    const wrapper = wrap_call_handler({
      action: async ({ userId }) => {
        return await this.teamsService.createTeamMember({
          ...createTeamDto,
          owner: userId,
        });
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-team')
  findAll(@Request() req, @Res() res: Response) {
    const wrapper = wrap_call_handler({
      action: async ({ userId }) => {
        return await this.teamsService.getTeamMember({
          owner: userId,
        });
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/members/:id/edit')
  updateMemberById(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
    @Body() updateTeamMemberDto: UpdateMemberDto,
  ) {
    const wrapper = wrap_call_handler({
      action: async ({ userId }) => {
        return await this.teamsService.updateTeamMember(id, {
          owner: userId,
          ...updateTeamMemberDto,
        });
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/members/:id')
  deleteMemberById(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const wrapper = wrap_call_handler({
      action: async ({ userId }) => {
        return await this.teamsService.deleteTeamMember(id, {
          owner: userId,
        });
      },
    });
    wrapper(req, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(+id);
  }
}
