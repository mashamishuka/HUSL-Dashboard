// import { UpdateFinanceDto } from './dto/update-finance.dto';
import { Request as ExpressRequest, Response } from 'express';
import wrap_call_handler from 'helpers/wrap_call_handler';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';

import { CreateFinanceDto } from './dto/create-finance.dto';
import { FinancesService } from './finances.service';

@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/stripe/config')
  async create(
    @Body() createFinanceDto: CreateFinanceDto,
    @Request() req: ExpressRequest,
    @Res() res: Response,
  ) {
    const wrapper = wrap_call_handler({
      action: async ({ user, userId }) => {
        if (user?.role === 'admin' && createFinanceDto?.user) {
          userId = createFinanceDto?.user;
        }
        return await this.financesService.create({
          ...createFinanceDto,
          userId,
        });
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/config')
  async findOne(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => this.financesService.findOne(userId),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/config/:userId')
  async findOneById(
    @Res() res: Response,
    @Request() req: ExpressRequest,
    @Param() params,
  ) {
    const wrapper = wrap_call_handler({
      requires_admin: true,
      action: ({}) => this.financesService.findOne(params?.userId),
    });
    wrapper(req, res);
  }

  // Get/verify IAN user stripe account connection
  @UseGuards(JwtAuthGuard)
  @Get('/stripe/ian-connection')
  async get(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) =>
        this.financesService.verifyStripeOwnership(userId),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/revenue')
  async getStripeBalanceReport(
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ userId, req }) =>
        this.financesService.getRevenueReport({ userId, ...req?.query }),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/user_invoices')
  async getUserInvoices(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: async ({ req, userId }) => {
        const all_invoices = await this.financesService.getInvoicesFormatted(
          userId,
          req?.query.unix_min,
          req?.query.unix_max,
        );
        const whitelabels = await this.financesService.getWhitelabelTags();
        const whitelabel = whitelabels.whitelabel_by_id[userId];

        const user_invoices = all_invoices.filter(
          ({ builderName }) => builderName === whitelabel,
        );
        return user_invoices;
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/whitelabels')
  async getWhitelabelTags(
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    const wrapper = wrap_call_handler({
      action: ({}) => this.financesService.getWhitelabelTags(),
      requires_admin: true,
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/monthlyGrowthReport')
  async getMonthlyGrowthReport(
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) =>
        this.financesService.getMonthlyGrowthReport(userId),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/churnRate')
  async getChurnRate(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => this.financesService.getStripeChurnRate(userId),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/cpa')
  async getCPA(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => this.financesService.getStripeCPA(userId),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/customers')
  async getCustomers(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) =>
        this.financesService.getStripeCustomers(userId, req?.query),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/customerGrowths')
  async getCustomerGrowths(
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) =>
        this.financesService.getStripeCustomerGrowth(userId),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/invoices')
  async getStripeInvoices(
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => this.financesService.getStripeInvoices(userId),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/all_invoices')
  async getAllInvoices(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: ({ req }) =>
        this.financesService
          .getInvoicesFormatted(
            req?.query.user_id,
            req?.query.unix_min,
            req?.query.unix_max,
          )
          .then((result) => ({ invoices_in_time_period: result })),
      requires_admin: true,
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/recurring-revenue')
  async getRecurringRevenue(
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) =>
        this.financesService.getRecurringRevenue(userId, req?.query),
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stripe/weekly-sales')
  async getWeeklySales(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => this.financesService.getWeeklySales(userId),
    });
    wrapper(req, res);
  }

  @Post('/stripe/webhook')
  async stripeWebhook(@Res() res: Response, @Request() req: ExpressRequest) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => this.financesService.stripeWebhook(req?.body),
    });
    wrapper(req, res);
  }
  // @Get()
  // findAll() {
  //   return this.financesService.findAll();
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFinanceDto: UpdateFinanceDto) {
  //   return this.financesService.update(+id, updateFinanceDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.financesService.remove(+id);
  // }
}
