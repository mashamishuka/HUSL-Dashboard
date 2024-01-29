import { Request, Response } from 'express';
import wrap_call_handler from 'helpers/wrap_call_handler';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { CourseParticipantsService } from './course-participants.service';
import { CreateCourseParticipantDto } from './dto/create-course-participant.dto';
import { TrackCourseParticipantDto } from './dto/track-course-participant.dto';

@Controller('course-participants')
export class CourseParticipantsController {
  constructor(
    private readonly courseParticipantsService: CourseParticipantsService,
  ) {}

  /**
   * Create user progress, join if the user is not joined yet, and create a progress for each topic
   * @param createCourseParticipantDto
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('')
  createUserProgress(
    @Body() createCourseParticipantDto: CreateCourseParticipantDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const userId = req?.user?._id;
        return this.courseParticipantsService.createUserProgress(
          userId,
          createCourseParticipantDto,
        );
      },
    });
    wrapper(req, res);
  }

  // get all user progress
  @UseGuards(JwtAuthGuard)
  @Get('/progress')
  getAllUserProgress(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const userId = req?.user?._id;
        return this.courseParticipantsService.getAllUserProgress(userId);
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:courseId/progress')
  getUserProgress(
    @Param('courseId') courseId,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const userId = req?.user?._id;
        return this.courseParticipantsService.getUserProgress(userId, courseId);
      },
    });
    wrapper(req, res);
  }

  @Get('/:courseId/trace/:topicId')
  findTracedProgress(
    @Param('courseId') courseId: string,
    @Param('topicId') topicId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const userId = req?.user?._id;
        return this.courseParticipantsService.findTracedProgress(
          userId,
          courseId,
          topicId,
        );
      },
    });
    wrapper(req, res);
  }

  @Patch('/:courseId/trace')
  traceProgress(
    @Param('courseId') courseId: string,
    @Body() trackCourseParticipantDto: TrackCourseParticipantDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const userId = req?.user?._id;
        return this.courseParticipantsService.traceProgress(
          userId,
          courseId,
          trackCourseParticipantDto,
        );
      },
    });
    wrapper(req, res);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseParticipantsService.remove(+id);
  }
}
