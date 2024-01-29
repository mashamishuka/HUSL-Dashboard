import mongoose, { Model } from 'mongoose';
import { CourseParticipantsService } from 'src/course-participants/course-participants.service';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Course } from './courses.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private participantService: CourseParticipantsService,
  ) {}

  /**
   * Create new course
   * @param createCourseDto
   * @returns
   */
  create(createCourseDto: CreateCourseDto) {
    const body = {
      ...createCourseDto,
      createdBy: createCourseDto.createdBy,
    };
    const course = new this.courseModel(body);
    return course.save();
  }

  /**
   * Add chapter to course
   * @returns
   */
  async createChapter(courseId: string, chapterData?: Record<string, any>) {
    const body = {
      _id: new mongoose.Types.ObjectId(),
      title: chapterData.title,
    };
    const course = await this.courseModel.updateOne(
      { _id: courseId },
      { $push: { chapters: body } },
    );
    return course;
  }

  /**
   * Add topic to chapter
   * @returns
   */
  async createTopic(
    courseId: string,
    chapterId: string,
    topicData?: Record<string, any>,
  ) {
    const body = {
      _id: new mongoose.Types.ObjectId(),
      title: topicData.title,
      content: topicData.content,
      video: topicData.video,
      reward: topicData.reward,
      completion_time: topicData.completion_time,
    };
    const course = await this.courseModel.updateOne(
      { _id: courseId, 'chapters._id': new mongoose.Types.ObjectId(chapterId) },
      { $push: { 'chapters.$.topics': body } },
    );
    return course;
  }

  /**
   * Edit course
   */
  async editCourse(courseId: string, courseData?: UpdateCourseDto) {
    // prevent to edit chapter and topic
    if (courseData.chapters) {
      delete courseData.chapters;
    }
    const course = await this.courseModel.updateOne(
      { _id: courseId },
      courseData,
    );
    return course;
  }

  /**
   * Edit chapter
   */
  async editChapter(
    courseId: string,
    chapterId: string,
    chapterData?: Record<string, any>,
  ) {
    const course = await this.courseModel.updateOne(
      { _id: courseId, 'chapters._id': new mongoose.Types.ObjectId(chapterId) },
      { $set: { 'chapters.$.title': chapterData.title } },
    );
    return course;
  }

  /**
   * Edit topic
   */
  async editTopic(
    courseId: string,
    chapterId: string,
    topicId: string,
    topicData?: Record<string, any>,
  ) {
    const body = Object.keys(topicData).map((key) => {
      return {
        [`chapters.$.topics.$[topic].${key}`]: topicData[key],
      };
    });
    // make above only 1 object
    const data = body.reduce((acc, cur) => {
      return { ...acc, ...cur };
    }, {});

    const course = await this.courseModel.updateOne(
      {
        _id: courseId,
        'chapters._id': new mongoose.Types.ObjectId(chapterId),
        'chapters.topics._id': new mongoose.Types.ObjectId(topicId),
      },
      {
        $set: data,
      },
      {
        arrayFilters: [{ 'topic._id': new mongoose.Types.ObjectId(topicId) }],
      },
    );
    return course;
  }

  /**
   * delete course
   */
  async deleteCourse(courseId: string) {
    const course = await this.courseModel.updateOne(
      { _id: courseId },
      { deleted: true },
    );
    return course;
  }

  /**
   * delete chapter
   */
  async deleteChapter(courseId: string, chapterId: string) {
    const course = await this.courseModel.updateOne(
      { _id: courseId },
      { $pull: { chapters: { _id: new mongoose.Types.ObjectId(chapterId) } } },
    );
    return course;
  }

  /**
   * Delete topic
   */
  async deleteTopic(courseId: string, chapterId: string, topicId: string) {
    const course = await this.courseModel.updateOne(
      { _id: courseId, 'chapters._id': new mongoose.Types.ObjectId(chapterId) },
      {
        $pull: {
          'chapters.$.topics': { _id: new mongoose.Types.ObjectId(topicId) },
        },
      },
    );
    return course;
  }

  /**
   * Get all courses
   * @returns
   */
  async findAll(query?: Record<string, any>) {
    const courses = await this.courseModel.find({
      ...query,
      deleted: false,
    });
    return courses;
  }

  /**
   * Get course by id
   * @returns
   */
  async findOne(id: string, userId?: string) {
    const course = await this.courseModel.findById(id);
    // get user progress
    if (userId) {
      const progress = await this.participantService.getUserProgress(
        userId,
        id,
      );
      return { ...course.toJSON(), progress };
    }
    return course;
  }
}
