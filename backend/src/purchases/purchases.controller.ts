import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PurchasesService } from './purchases.service';
import { Response } from 'express';
import wrap_call_handler from 'helpers/wrap_call_handler';
const stripe = require('stripe')(
  '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',
);

const SECONDS_PER_MONTH = 30 * 24 * 3600;

function unix_timestamp() {
  return Math.floor(Date.now() / 1000);
}

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMine(@Res() res: Response, @Req() req) {
    const wrapper = wrap_call_handler({
      action: ({ req }) =>
        this.purchasesService.findAll({
          ...req?.query,
          user: req.user._id,
        }),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async findAll(@Res() res: Response, @Req() req) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const q = req?.query;
        return this.purchasesService.findAll({
          ...q,
        });
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions')
  async subscriptions(
    @Res() res: Response,
    // @Req() req
  ) {
    try {
      // const userData: any = req?.user;
      // if (userData?.role !== 'admin') {
      //   throw new Error("You don't have access to this data.");
      // }
      const query = {
        name: 'subscription',
        state: 'completed',
      };
      const data = await this.purchasesService.findAll(query);
      const subscribers = [];

      for (let i = 0; i < data.length; i++) {
        const subscription = data[i];
        const age_in_seconds = unix_timestamp() - subscription.created;
        const is_still_active = age_in_seconds < SECONDS_PER_MONTH;
        if (is_still_active && !subscribers.includes(subscription.user)) {
          subscribers.push(subscription.user);
        }
      }

      return res.status(HttpStatus.OK).json({
        data: subscribers,
        message: 'Purchases found',
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
  @Get('subscriptions/all')
  async get_all_active_subscriptions(@Res() res: Response, @Req() req) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const { stripe_price_id, ...q } = req?.query;
        return this.purchasesService.get_all_active_subscriptions(
          stripe_price_id,
          q,
        );
      },
      requires_admin: false,
    });

    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription/status')
  async subscription_state(@Res() res: Response, @Req() req) {
    const wrapper = wrap_call_handler({
      action: ({ req }) =>
        this.purchasesService.get_subscription_status_of_purchase(
          req.query.purchase_id,
        ),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('flatrates')
  async flatrates(@Res() res: Response, @Req() req) {
    const wrapper = wrap_call_handler({
      action: ({ req }) =>
        this.purchasesService.findAll({
          name: { $in: ['flatrate', 'direct'] },
          state: 'completed',
        }),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(
    @Body()
    args: {
      name: string;
      price: number;
      is_stripe_not_usdh: boolean;
      data: {
        quantity?: number;
        repetition?: string;
        stripe_price: string;
      };
    },
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const user = req?.user;
      const userId = user?._id;

      const purchase_object_id = this.purchasesService.random_object_id();
      const purchase_id = purchase_object_id.toHexString();

      const base_url = 'https://app.husl.xyz'; // TODO localhost in dev
      const callback_url = `${base_url}/services?callback_purchase_id=${purchase_id}`;

      const subscription_session: Record<string, any> = args.is_stripe_not_usdh
        ? await stripe.checkout.sessions.create({
            mode: args.data.repetition === 'once' ? 'payment' : 'subscription',
            line_items: [
              {
                price: args.data.stripe_price,
                quantity: args.data.quantity,
              },
            ],
            // TODO replace url
            success_url: callback_url,
            cancel_url: callback_url,
          })
        : null;

      await this.purchasesService.insertOne({
        _id: purchase_object_id,
        user: userId,
        name: args.name,
        price: args.price,
        is_stripe_not_usdh: args.is_stripe_not_usdh,
        created: unix_timestamp(),
        customers: args.data.quantity,
        repetition: args.data.repetition,
        data: args.data,
        state: 'pending',
        subscription_session,
      });

      return res.status(HttpStatus.OK).json({
        subscription_session,
        message: 'Subscription added',
        purchase_id: purchase_id,
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
  @Post('direct-subscribe')
  async addManual(
    @Body()
    args: {
      name: string;
      note: string;
      user: string;
      data: {
        quantity?: number;
        repetition?: string;
        stripe_price: string;
      };
    },
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const user = req?.user;
      if (user?.role !== 'admin')
        throw new Error("You don't have access to this data.");

      const purchase_object_id = this.purchasesService.random_object_id();
      const purchase_id = purchase_object_id.toHexString();

      await this.purchasesService.insertOne({
        _id: purchase_object_id,
        user: args?.user,
        name: args?.name,
        price: 0,
        note: args.note,
        is_stripe_not_usdh: true,
        created: unix_timestamp(),
        customers: args.data.quantity,
        repetition: args.data.repetition,
        data: args.data,
        state: 'completed',
      });

      return res.status(HttpStatus.OK).json({
        message: 'Subscription added',
        purchase_id: purchase_id,
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
  @Delete('direct-subscribe/:purchase_id')
  async deleteDirect(@Param() params, @Res() res: Response, @Req() req) {
    try {
      const user = req?.user;
      if (user?.role !== 'admin')
        throw new Error("You don't have access to this data.");

      await this.purchasesService.delete(params?.purchase_id);
      return res.status(HttpStatus.OK).json({
        message: 'Purchase deleted',
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

  @Post('update')
  async update(
    @Body()
    args: { purchase_id: string },
    @Res() res: Response,
    // @Req() req,
  ) {
    try {
      await this.purchasesService.update(args.purchase_id);
      return res.status(HttpStatus.OK).json({
        message: 'Purchase updated',
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
  @Post('add_tx_hash')
  async add_transaction_hash(
    @Body()
    args: { purchase_id: string; transaction_hash: string },
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const user = req?.user;
      const userId = user?._id;

      await this.purchasesService.add_transaction_hash(
        args.purchase_id,
        userId,
        args.transaction_hash,
      );
      return res.status(HttpStatus.OK).json({
        message: 'Transaction hash added to purchase',
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

  // @UseGuards(JwtAuthGuard)
  @Post('test')
  async test(
    @Body()
    args: { purchase_id: string; transaction_hash: string },
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      // const user = req?.user;
      // const userId = user?._id;

      // if (user?.role !== 'admin') {
      //   throw new Error("You don't have access to this function.");
      // }

      const data = await this.purchasesService.test();

      return res.status(HttpStatus.OK).json({
        data,
        message: 'Test completed',
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
