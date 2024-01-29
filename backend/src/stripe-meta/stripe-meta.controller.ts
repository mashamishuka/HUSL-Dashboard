import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { StripeMetaService } from './stripe-meta.service';
import wrap_call_handler from 'helpers/wrap_call_handler';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('stripe-meta')
export class StripeMetaController {
  constructor(private readonly stripeMetaService: StripeMetaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/accounts')
  async findAll(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      requires_admin: true,
      action: () => this.stripeMetaService.getConnectedAccounts(),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update/:id')
  async updateStripeData(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const wrapper = wrap_call_handler({
      requires_admin: true,
      action: () => this.stripeMetaService.updateStripeData(id),
    });
    wrapper(req, res);
  }
}
