import { UsersModule } from 'src/users/users.module';

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FinancesController } from './finances.controller';
import { Finance, FinanceSchema } from './finances.schema';
import { FinancesService } from './finances.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Finance.name, schema: FinanceSchema }]),
    forwardRef(() => UsersModule),
  ],
  controllers: [FinancesController],
  providers: [FinancesService],
  exports: [FinancesService],
})
export class FinancesModule {}
