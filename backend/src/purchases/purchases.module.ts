import { FinancesModule } from 'src/finances/finances.module';
import { UsersModule } from 'src/users/users.module';
import { User, UserSchema } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';

import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { MongooseModule } from '@nestjs/mongoose';

import { PurchasesController } from './purchases.controller';
import { Purchase, PurchaseSchema } from './purchases.schema';
import { PurchasesService } from './purchases.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => FinancesModule),
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService, UsersService],
})
export class PurchasesModule {}
