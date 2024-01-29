import { Request, Response } from 'express';
import wrap_call_handler from 'helpers/wrap_call_handler';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { CreateGoalTrackerDto } from './dto/create-goal-tracker.dto';
import { GoalTrackersService } from './goal-trackers.service';

@Controller('goal-trackers')
export class GoalTrackersController {
  constructor(private readonly goalTrackersService: GoalTrackersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createGoalTrackerDto: CreateGoalTrackerDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => {
        // append user
        createGoalTrackerDto.user = userId;
        return this.goalTrackersService.create(createGoalTrackerDto);
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/claim-reward/:id')
  claimReward(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => {
        return this.goalTrackersService.claimReward(userId, req.params.id);
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/history')
  findAllUserTrackers(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => {
        return this.goalTrackersService.findAllUserTrackers(userId);
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/mine')
  findActiveTracker(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => {
        return this.goalTrackersService.findMyActiveTracker(userId);
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/reset')
  resetActiveTracker(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => {
        return this.goalTrackersService.resetActiveTracker(userId);
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/growth')
  growth(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => {
        return this.goalTrackersService.trackerGrowth(userId);
      },
    });
    wrapper(req, res);
  }
}
