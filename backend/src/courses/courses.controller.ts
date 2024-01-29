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

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createCourseDto: CreateCourseDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: ({ userId }) => {
        createCourseDto.createdBy = userId;
        return this.coursesService.create(createCourseDto);
      },
      requires_admin: true,
    });

    wrapper(req, res);
  }

  /**
   * Update course
   * @param updateCourseDto
   * @param res
   * @param req
   */
  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.coursesService.editCourse(id, updateCourseDto);
      },
      requires_admin: true,
    });

    wrapper(req, res);
  }

  /**
   * Update chapter
   */
  @UseGuards(JwtAuthGuard)
  @Patch('/:id/chapters/:chapterId')
  updateChapter(
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
    @Body() body: Record<string, any>,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.coursesService.editChapter(id, chapterId, body);
      },
      requires_admin: true,
    });
    wrapper(req, res);
  }

  /**
   * Update topic
   */
  @UseGuards(JwtAuthGuard)
  @Patch('/:id/chapters/:chapterId/topics/:topicId')
  updateTopic(
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
    @Param('topicId') topicId: string,
    @Body() body: Record<string, any>,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.coursesService.editTopic(id, chapterId, topicId, body);
      },
      requires_admin: true,
    });
    wrapper(req, res);
  }

  /**
   * Delete course
   */
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  deleteCourse(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.coursesService.deleteCourse(id);
      },
      requires_admin: true,
    });
    wrapper(req, res);
  }

  /**
   * delete chapter
   */
  @UseGuards(JwtAuthGuard)
  @Delete('/:id/chapters/:chapterId')
  deleteChapter(
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.coursesService.deleteChapter(id, chapterId);
      },
      requires_admin: true,
    });
    wrapper(req, res);
  }

  /**
   * Delete topic
   */
  @UseGuards(JwtAuthGuard)
  @Delete('/:id/chapters/:chapterId/topics/:topicId')
  deleteTopic(
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
    @Param('topicId') topicId: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.coursesService.deleteTopic(id, chapterId, topicId);
      },
      requires_admin: true,
    });
    wrapper(req, res);
  }

  /**
   * Add chapter to course
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('/:id/chapters')
  createChapter(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.coursesService.createChapter(id, body);
      },
      requires_admin: true,
    });

    wrapper(req, res);
  }

  /**
   * Add topic to chapter
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('/:id/chapters/:chapterId/topics')
  createTopic(
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
    @Body() body: Record<string, any>,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const wrapper = wrap_call_handler({
      action: () => {
        return this.coursesService.createTopic(id, chapterId, body);
      },
      requires_admin: true,
    });
    wrapper(req, res);
  }

  @Get()
  findAll(@Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        return this.coursesService.findAll(req?.query);
      },
    });
    wrapper(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Res() res: Response, @Req() req: Request) {
    const wrapper = wrap_call_handler({
      action: ({ req }) => {
        const userId = req?.user?.userId;
        return this.coursesService.findOne(id, userId);
      },
    });
    wrapper(req, res);
  }
}
