import { Request, Response } from 'express';
import wrap_call_handler from 'helpers/wrap_call_handler';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { CreateRewardDto } from './dto/create-reward.dto';
import { RewardsService } from './rewards.service';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createRewardDto: CreateRewardDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.rewardsService.create(createRewardDto);
      },
      requires_admin: true,
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.rewardsService.findAll(req?.query);
      },
    });
    wrapper(req, res);
  }

  /**
   * check if a user is able to claim a reward
   */
  @UseGuards(JwtAuthGuard)
  @Get('/check/:name')
  check(@Param() params, @Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const user = req?.user?._id;
        const role = req?.user?.role;
        return this.rewardsService.check({
          user,
          role,
          name: params?.name,
          ...req?.query,
        });
      },
    });
    wrapper(req, res);
  }

  @Post('/stripe/webhook')
  async stripeWebhook(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        return this.rewardsService.stripeWebhook(req?.body);
      },
    });
    wrapper(req, res);
  }

  /**
   * Get reward by id, return if user able to claim the reward
   */
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  checkRewardById(@Param() params, @Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const user = req?.user?._id;
        return this.rewardsService.findRewardById(user, params?.id);
      },
    });
    wrapper(req, res);
  }

  /**
   * claim a reward
   */
  @UseGuards(JwtAuthGuard)
  @Post('/claim/:name')
  claim(@Param() params, @Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const user = req?.user?._id;
        return this.rewardsService.sendReward(user, params?.name);
      },
    });
    wrapper(req, res);
  }
}
