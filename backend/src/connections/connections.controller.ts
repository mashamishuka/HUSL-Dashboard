import { Request, Response } from 'express';
import wrap_call_handler from 'helpers/wrap_call_handler';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { ConnectionsService } from './connections.service';
import { GetRingcentralTokenDto } from './dto/get-ringcentral-token.dto';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/ringcentral/get-token')
  async authRingCentralToken(
    @Body() body: GetRingcentralTokenDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => {
        return this.connectionsService.authRingCentralToken(userId, body);
      },
    });

    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/my/:connections')
  findAll(
    @Res() res: Response,
    @Req() req: Request,
    @Param('connections') connections: string,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => {
        return this.connectionsService.findMyConnection(userId, connections);
      },
    });

    wrapper(req, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.connectionsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.connectionsService.remove(+id);
  }
}
