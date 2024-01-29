import {
  Controller,
  Get,
  HttpStatus,
  Request,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { Response, Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FinancesService } from 'src/finances/finances.service';

function wrap_call_handler({
  action,
  requires_admin = false,
}: {
  action: (arg0: any) => Promise<any>;
  requires_admin?: boolean;
}) {
  return async (req: ExpressRequest, res: Response) => {
    try {
      const user: any = req?.user;
      const userId = user?._id;

      if (requires_admin) {
        if (user?.role !== 'admin') {
          throw new UnauthorizedException('Unauthorized');
        }
      }

      const data = await action({ userId, user, req, res });

      return res.status(HttpStatus.OK).json({
        data,
        message: `Successfully called ${req.route.path}`,
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  };
}

@Controller('payouts')
export class PayoutsController {
  constructor(
    private readonly payoutsService: PayoutsService,
    private readonly financesService: FinancesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async getAllInvoices(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: ({ req }) =>
        this.payoutsService.find({
          ...req?.query,
        }),
      requires_admin: true,
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get')
  async getInvoices(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: async ({ req, userId }) => {
        return this.payoutsService.find({
          user: userId,
          ...req?.query,
        });
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/foundercards')
  async getFoundercards(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: ({ req }) =>
        this.payoutsService.get_founder_cards({
          ...req?.query,
        }),
      requires_admin: false, // does not require admin since public on-chain information
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/store')
  async storePayout(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: ({ req }) =>
        this.payoutsService.store_payout({
          ...req?.query,
        }),
      requires_admin: true,
    });
    wrapper(req, res);
  }
}
