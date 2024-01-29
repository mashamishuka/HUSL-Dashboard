import { FinancesModule } from 'src/finances/finances.module';
import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PayoutsController } from './payouts.controller';
import { Payout, PayoutSchema } from './payouts.schema';
import { PayoutsService } from './payouts.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payout.name, schema: PayoutSchema }]),
    UsersModule,
    FinancesModule,
  ],
  controllers: [PayoutsController],
  providers: [PayoutsService],
})
export class PayoutsModule {}
