import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';

import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { Roadmap } from './roadmaps.schema';

@Injectable()
export class RoadmapsService {
  constructor(
    @InjectModel(Roadmap.name) private roadmapModel: Model<Roadmap>,
    private userService: UsersService,
  ) {}

  async create(createRoadmapDto: CreateRoadmapDto) {
    try {
      const user = await this.userService.findOne(createRoadmapDto?.user);
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      // create or update the roadmap
      const roadmap = await this.roadmapModel.findOneAndUpdate(
        {
          user: user._id,
        },
        {
          ...createRoadmapDto,
        },
        {
          upsert: true,
          new: true,
        },
      );
      return roadmap;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get all user roadmap
   * @param query
   * @returns
   */
  async findAll(query?: Record<string, any>) {
    try {
      const data = await this.roadmapModel.findOne(query);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }
}
