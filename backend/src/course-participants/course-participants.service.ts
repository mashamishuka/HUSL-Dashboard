import { Model } from 'mongoose';
import { Course } from 'src/courses/courses.schema';
import { CreateRewardDto } from 'src/rewards/dto/create-reward.dto';
import { RewardsService } from 'src/rewards/rewards.service';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CourseParticipant } from './course-participants.schema';
import { CreateCourseParticipantDto } from './dto/create-course-participant.dto';
import { TrackCourseParticipantDto } from './dto/track-course-participant.dto';

@Injectable()
export class CourseParticipantsService {
  constructor(
    @InjectModel(CourseParticipant.name)
    private participantModel: Model<CourseParticipant>,
    private readonly rewardService: RewardsService,
  ) {}

  private rewardFormula = (
    topic?: Course['chapters'][0]['topics'][0] & {
      user: string;
    },
  ) => {
    const rewardName = `course-${topic?.user}-${topic?._id}`;
    return {
      name: rewardName,
      amount: topic?.reward,
      reference: `course-${topic?._id}`,
      description: `You did it, great job completing that lesson! Here’s [amount] $HSL 🔥`,
      claimableBy: topic?.user,
    };
  };

  private async createReward(body?: CreateRewardDto) {
    // send reward to user
    const rewardResponse = await this.rewardService.create(body);
    // if there is no reward response, then return error
    if (!rewardResponse) {
      throw new BadRequestException('Failed to create reward');
    }
    // return the reward response
    return rewardResponse;
  }

  async createUserProgress(
    userId: string,
    createCourseParticipantDto: CreateCourseParticipantDto,
  ) {
    // get course & topic id
    const { course_id, topic_id } = createCourseParticipantDto;
    // if there is no course id, return error
    if (!course_id || !topic_id) {
      throw new BadRequestException('Course id or topic id is not provided');
    }
    // get course-participants, if not exist, then create a new one
    let courseParticipant = await this.participantModel.findOne({
      course: course_id,
      user: userId,
    });
    // if course-participants not exist, then create a new one
    if (!courseParticipant) {
      courseParticipant = await this.participantModel.create({
        course: course_id,
        user: userId,
      });
    }
    // populate course and get topics inside the course
    const participant = await this.participantModel
      .findOne({
        _id: courseParticipant._id,
      })
      .populate({
        path: 'course',
        populate: {
          path: 'chapters',
          populate: {
            path: 'topics',
          },
        },
      });
    // get active chapter by topic id
    // check if the topic is already completed
    const isTopicCompleted = participant.completed_topics.includes(topic_id);

    // is reward claimed
    const isRewardClaimed = participant.completion_data.find(
      (data) => data.topic_id === topic_id,
    )?.reward_claimed;
    // calculate progress
    const totalTopics = participant.course.chapters.reduce(
      (acc, chapter) => acc + chapter.topics.length,
      0,
    );
    const completedTopics = participant.completed_topics.length;
    const progress = (completedTopics / totalTopics) * 100;

    // if progress is 100, then set is_completed to true
    if (progress === 100) {
      participant.is_completed = true;
      participant.completed_at = new Date();
    }

    // find active topic
    const activeTopic = participant.course.chapters
      .map((chapter) => chapter.topics)
      .flat()
      .find((topic) => topic._id?.toString() === topic_id);

    // if the topic is already completed, then return error
    if (isTopicCompleted && isRewardClaimed) {
      // immediate return
      return {
        ...participant.toJSON(),
        topic: activeTopic,
        progress,
      };
    }
    // if the topic is not completed, then add the topic to the completed_topics
    // but make sure it's not duplicated
    if (!isTopicCompleted) {
      participant.completed_topics.push(topic_id);
    }

    if (createCourseParticipantDto?.completion_data) {
      // append completion_data based on topic_id if exist, if not, create a new one
      const completionData = participant.completion_data.find(
        (data) => data.topic_id == topic_id,
      );
      // create a new reward if the topic is completed
      if (createCourseParticipantDto.completion_data.is_completed) {
        const topic = participant.course.chapters
          .map((chapter) => chapter.topics)
          .flat()
          .find((topic) => topic._id?.toString() === topic_id);
        // create a new reward
        const rewardObj = this.rewardFormula({
          ...topic,
          user: userId,
        });
        // create a new reward
        const reward = await this.createReward(rewardObj);
        if (reward) {
          // push to completion_data
          createCourseParticipantDto.completion_data.reward = reward._id;
        }
      }
      // if user is requesting to claim the reward
      if (createCourseParticipantDto.completion_data.reward_claimed) {
        // then send the reward
        const reward = await this.rewardService.sendReward(
          userId,
          this.rewardFormula({
            user: userId,
            ...activeTopic,
          }).name,
        );
        // if there is no reward, then return error
        if (!reward) {
          throw new BadRequestException('Failed to send reward');
        }
      }
      if (completionData) {
        // update existing based on topic id
        const index = participant.completion_data.findIndex(
          (data) => data.topic_id === topic_id,
        );
        participant.completion_data[index] = {
          ...participant.completion_data[index],
          ...createCourseParticipantDto.completion_data,
        };
      } else {
        participant.completion_data.push(
          createCourseParticipantDto.completion_data,
        );
      }
    }

    // remove progress
    delete participant.progress;
    // save the participant
    await participant.save();

    // return the participant
    return {
      ...participant.toJSON(),
      topic: activeTopic,
      progress,
    };
  }

  async getUserProgress(userId: string, courseId: string) {
    // get course-participants by courseId
    const userProgress = await this.participantModel
      .findOne({
        course: courseId,
        user: userId,
      })
      .populate({
        path: 'course',
        populate: {
          path: 'chapters',
          populate: {
            path: 'topics',
          },
        },
      });

    // if there is no participant, then return error
    if (!userProgress) {
      throw new BadRequestException('User progress not found');
    }
    // calculate progress
    const totalTopics = userProgress.course.chapters.reduce(
      (acc, chapter) => acc + chapter.topics.length,
      0,
    );
    const completedTopics = userProgress.completed_topics.length;
    const progress = (completedTopics / totalTopics) * 100;
    return {
      ...userProgress.toJSON(),
      progress,
    };
  }

  async getAllUserProgress(userId: string) {
    // get course-participants by courseId
    const userProgress = await this.participantModel
      .find({
        user: userId,
      })
      .populate({
        path: 'course',
        populate: {
          path: 'chapters',
          populate: {
            path: 'topics',
          },
        },
      });
    if (!userProgress) {
      return [];
    }
    // calculate progress
    const progress = userProgress.map((progress) => {
      const totalTopics = progress.course.chapters.reduce(
        (acc, chapter) => acc + chapter.topics.length,
        0,
      );
      const completedTopics = progress.completed_topics.length;
      const progressPercentage = (completedTopics / totalTopics) * 100;
      return {
        ...progress.toJSON(),
        progress: progressPercentage,
      };
    });
    return progress;
  }

  async findTracedProgress(userId: string, courseId: string, topicId: string) {
    // find traced progress by its topic id
    const tracedProgress = await this.participantModel.findOne({
      user: userId,
      course: courseId,
      'completion_meta.topic_id': topicId,
    });
    // return only the completion_meta
    if (!tracedProgress) {
      return null;
    }
    return tracedProgress.completion_meta?.find((v) => v.topic_id === topicId);
  }

  async traceProgress(
    userId: string,
    courseId: string,
    body: TrackCourseParticipantDto,
  ) {
    // get course-participants, if not exist, then create a new one
    let courseParticipant = await this.participantModel.findOne({
      course: courseId,
      user: userId,
    });
    // if course-participants not exist, then create a new one
    if (!courseParticipant) {
      courseParticipant = await this.participantModel.create({
        course: courseId,
        user: userId,
      });
    }

    // if there is no participant, then return error
    if (!courseParticipant) {
      throw new BadRequestException('User progress not found');
    }
    // push to completion_meta if same topic_id
    const completionMeta = courseParticipant.completion_meta.find(
      (meta) => meta.topic_id === body.topic_id,
    );
    if (completionMeta) {
      // update existing based on topic id
      const index = courseParticipant.completion_meta.findIndex(
        (meta) => meta.topic_id === body.topic_id,
      );
      // update only effected fields if there is any on body
      // if there is no effected fields on body, then keep the old one
      courseParticipant.completion_meta[index] = {
        ...courseParticipant.completion_meta[index],
        ...body,
      };
    }
    // if not, then push to completion_meta
    else {
      courseParticipant.completion_meta.push(body);
    }
    // save the participant
    await courseParticipant.save();
    // return the participant
    return courseParticipant;
  }

  remove(id: number) {
    return `This action removes a #${id} courseParticipant`;
  }
}
