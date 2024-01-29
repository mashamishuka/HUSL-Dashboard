import { AccountsModule } from 'src/accounts/accounts.module';
import { FinancesModule } from 'src/finances/finances.module';
import { NichesModule } from 'src/niches/niches.module';
import { ProductsModule } from 'src/products/products.module';
import { SocialAccountsModule } from 'src/social-accounts/social-accounts.module';
import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessesController } from './businesses.controller';
import { Business, BusinessSchema } from './businesses.schema';
import { BusinessesService } from './businesses.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
    ]),
    ProductsModule,
    forwardRef(() => NichesModule),
    FinancesModule,
    UsersModule,
    AccountsModule,
    SocialAccountsModule,
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
