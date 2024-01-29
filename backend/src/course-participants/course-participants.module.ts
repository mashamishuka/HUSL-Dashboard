import { RewardsModule } from 'src/rewards/rewards.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CourseParticipantsController } from './course-participants.controller';
import {
  CourseParticipant,
  CourseParticipantSchema,
} from './course-participants.schema';
import { CourseParticipantsService } from './course-participants.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseParticipant.name, schema: CourseParticipantSchema },
    ]),
    RewardsModule,
  ],
  controllers: [CourseParticipantsController],
  providers: [CourseParticipantsService],
  exports: [CourseParticipantsService],
})
export class CourseParticipantsModule {}
