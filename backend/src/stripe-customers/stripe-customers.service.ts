import * as stripeHelper from 'helpers/stripe';
import { groupBy } from 'lodash';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { FinancesService } from 'src/finances/finances.service';
import Stripe from 'stripe';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateStripeCustomerDto } from './dto/create-stripe-customer.dto';
import { UpdateStripeCustomerDto } from './dto/update-stripe-customer.dto';
import { StripeCustomer } from './stripe-customers.schema';

@Injectable()
export class StripeCustomersService {
  constructor(
    @InjectModel(StripeCustomer.name)
    private stripeCustomerModel: Model<StripeCustomer>,
    private financeService: FinancesService,
  ) {}

  create(createStripeCustomerDto: CreateStripeCustomerDto) {
    return 'This action adds a new stripeCustomer';
  }

  /**
   * Find stripe customers by their metadata tag
   * @returns
   */
  async findOneByUserTag(query?: Record<string, any>) {
    try {
      const userId = query?.userId;
      const stripeConfig = await this.financeService.getStripeConfig(userId);
      const stripe = new Stripe(stripeConfig?.secretKey, {
        apiVersion: null,
      });
      let invoices = await stripe.invoices.list().then(({ data }) => data);
      if (stripeConfig?.tag) {
        invoices = stripeHelper.filterInvoiceByMetadata(
          invoices,
          stripeConfig?.tag,
        );
      }
      // fetch invoices customer info
      const invoicesCustomerInfo = stripeHelper.mapAndExtractCustomer(invoices);
      // find customer data
      const customer = await this.stripeCustomerModel.findOne({
        tag: stripeConfig?.tag,
      });
      // create a new customer if not exists
      if (!customer) {
        await this.stripeCustomerModel.create({
          tag: stripeConfig?.tag,
          data: invoicesCustomerInfo,
        });
      } else {
        // update customer data
        await this.stripeCustomerModel.findOneAndUpdate(
          {
            tag: stripeConfig?.tag,
          },
          {
            data: invoicesCustomerInfo,
          },
        );
      }
      return invoicesCustomerInfo;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Find monthly stripe customers by their metadata tag
   * @returns
   */
  async findMonthlyByUserTag(query?: Record<string, any>) {
    try {
      const userId = query?.userId;
      const stripeConfig = await this.financeService.getStripeConfig(userId);
      const stripe = new Stripe(stripeConfig?.secretKey, {
        apiVersion: null,
      });
      let invoices = await stripe.invoices.list().then(({ data }) => data);
      if (stripeConfig?.tag) {
        invoices = stripeHelper.filterInvoiceByMetadata(
          invoices,
          stripeConfig?.tag,
        );
      }
      // fetch invoices customer info
      const invoicesCustomerInfo = stripeHelper.mapAndExtractCustomer(invoices);
      // find customer data
      const customer = await this.stripeCustomerModel.findOne({
        tag: stripeConfig?.tag,
      });

      // create a new customer if not exists
      if (!customer) {
        await this.stripeCustomerModel.create({
          tag: stripeConfig?.tag,
          data: invoicesCustomerInfo,
        });
      } else {
        // update customer data
        await this.stripeCustomerModel.findOneAndUpdate(
          {
            tag: stripeConfig?.tag,
          },
          {
            data: invoicesCustomerInfo,
          },
        );
      }
      const groupedByMonth = groupBy(invoicesCustomerInfo, (trx) => {
        return moment.unix(trx?.created).format('M');
      });
      const monthlyCustomers = moment.months().map((month, index) => {
        return {
          month,
          monthShort: moment.monthsShort()[index],
          customers: groupedByMonth[index + 1]?.length || 0,
        };
      });
      return {
        reportDate: moment().valueOf(),
        totalCustomers: invoicesCustomerInfo?.length || 0,
        data: monthlyCustomers,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  findAll() {
    return `This action returns all stripeCustomers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stripeCustomer`;
  }

  update(id: number, updateStripeCustomerDto: UpdateStripeCustomerDto) {
    return `This action updates a #${id} stripeCustomer`;
  }

  remove(id: number) {
    return `This action removes a #${id} stripeCustomer`;
  }
}
