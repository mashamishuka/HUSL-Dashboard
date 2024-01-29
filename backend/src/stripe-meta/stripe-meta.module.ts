import { Module } from '@nestjs/common';
import { StripeMetaService } from './stripe-meta.service';
import { StripeMetaController } from './stripe-meta.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeMeta, StripeMetaSchema } from './stripe-meta.schema';
import { FinancesModule } from 'src/finances/finances.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StripeMeta.name, schema: StripeMetaSchema },
    ]),
    FinancesModule,
  ],
  controllers: [StripeMetaController],
  providers: [StripeMetaService],
})
export class StripeMetaModule {}
