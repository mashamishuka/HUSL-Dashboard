import { BusinessesModule } from 'src/businesses/businesses.module';
import { NichesModule } from 'src/niches/niches.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LeadsController } from './leads.controller';
import { Leads, LeadsSchema } from './leads.schema';
import { LeadsService } from './leads.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Leads.name, schema: LeadsSchema }]),
    BusinessesModule,
    NichesModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
