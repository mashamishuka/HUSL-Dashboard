import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FbadsController } from './fbads.controller';
import { FbAds, FbAdsSchema } from './fbads.schema';
import { FbadsService } from './fbads.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FbAds.name, schema: FbAdsSchema }]),
    UsersModule,
  ],
  controllers: [FbadsController],
  providers: [FbadsService],
})
export class FbadsModule {}
