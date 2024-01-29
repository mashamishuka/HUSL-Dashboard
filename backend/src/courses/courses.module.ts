import { CourseParticipantsModule } from 'src/course-participants/course-participants.module';
import { FilesModule } from 'src/files/files.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CoursesController } from './courses.controller';
import { Course, CourseSchema } from './courses.schema';
import { CoursesService } from './courses.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    FilesModule,
    CourseParticipantsModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
