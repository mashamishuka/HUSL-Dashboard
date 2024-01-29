import { Request, Response } from 'express';
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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  //   @UseGuards(JwtAuthGuard)
  @Post('/add')
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.notificationsService.create(createNotificationDto);
      },
      requires_admin: true,
    });
    wrapper(req, res);
  }

  //   @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.notificationsService.findAll(req?.query);
      },
    });
    wrapper(req, res);
  }

  //   @UseGuards(JwtAuthGuard)
  @Delete('/delete/:id')
  delete(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const id = req?.params?.id;
        return this.notificationsService.delete(id);
      },
    });
    wrapper(req, res);
  }

  // @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findNotificationsById(
    @Param() params,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const id = req?.params?.id;
        return this.notificationsService.findNotificationsById(id);
      },
    });
    wrapper(req, res);
  }

  // @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  updateNotificationStatusById(
    @Param() params,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const id = req?.params?.id;
        return this.notificationsService.updateNotificationStatusById(id);
      },
    });
    wrapper(req, res);
  }
}
