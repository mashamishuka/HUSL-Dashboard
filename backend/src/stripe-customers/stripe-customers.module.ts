import { FinancesModule } from 'src/finances/finances.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StripeCustomersController } from './stripe-customers.controller';
import {
  StripeCustomer,
  StripeCustomerSchema,
} from './stripe-customers.schema';
import { StripeCustomersService } from './stripe-customers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StripeCustomer.name, schema: StripeCustomerSchema },
    ]),
    FinancesModule,
  ],
  controllers: [StripeCustomersController],
  providers: [StripeCustomersService],
})
export class StripeCustomersModule {}
