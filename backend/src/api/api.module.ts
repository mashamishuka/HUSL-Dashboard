import { BusinessesModule } from 'src/businesses/businesses.module';
import { FinancesModule } from 'src/finances/finances.module';
import { NichesModule } from 'src/niches/niches.module';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { APIController } from './api.controller';
import { API, APISchema } from './api.schema';
import { APIService } from './api.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: API.name, schema: APISchema }]),
    ProductsModule,
    NichesModule,
    FinancesModule,
    UsersModule,
    BusinessesModule,
  ],
  controllers: [APIController],
  providers: [APIService],
  exports: [APIService],
})
export class ApiModule {}
