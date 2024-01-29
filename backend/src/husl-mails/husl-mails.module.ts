import { Module } from '@nestjs/common';
import { HuslMailsService } from './husl-mails.service';
import { HuslMailController } from './husl-mails.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { HuslMailSchema } from './husl-mails.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'huslMails', schema: HuslMailSchema }]),
    UsersModule,
  ],
  controllers: [HuslMailController],
  providers: [HuslMailsService],
})
export class HuslMailModule {}
