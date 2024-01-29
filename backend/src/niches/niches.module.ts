import { Module } from '@nestjs/common';
import { NichesService } from './niches.service';
import { NichesController } from './niches.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NicheSchema } from './niches.schema';
import { ProductsModule } from 'src/products/products.module';
import { BusinessesModule } from 'src/businesses/businesses.module';
import { forwardRef } from '@nestjs/common/utils';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'niche', schema: NicheSchema }]),
    ProductsModule,
    forwardRef(() => BusinessesModule),
  ],
  controllers: [NichesController],
  providers: [NichesService],
  exports: [NichesService],
})
export class NichesModule {}
