import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TipsntrickController } from './tipsntricks.controller';
import { TipsNTrick, TipsNTrickSchema } from './tipsntricks.schema';
import { TipsntrickService } from './tipsntricks.service';

// TODO change tips and trick to Brand Overview
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TipsNTrick.name, schema: TipsNTrickSchema },
    ]),
    UsersModule,
  ],
  controllers: [TipsntrickController],
  providers: [TipsntrickService],
})
export class TipsntrickModule {}
