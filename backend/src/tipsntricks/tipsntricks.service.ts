import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';

import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateTipsntrickDto } from './dto/create-tipsntrick.dto';
import { TipsNTrick } from './tipsntricks.schema';

@Injectable()
export class TipsntrickService {
  constructor(
    @InjectModel(TipsNTrick.name) private tipsTrickModel: Model<TipsNTrick>,
    private userService: UsersService,
  ) {}

  async create(createTipsntrickDto: CreateTipsntrickDto) {
    try {
      const user = await this.userService.findOne(createTipsntrickDto?.user);
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      // create or update the tipsntrick
      const tipsntrick = await this.tipsTrickModel.findOneAndUpdate(
        {
          user: user._id,
        },
        {
          ...createTipsntrickDto,
        },
        {
          upsert: true,
          new: true,
        },
      );
      return tipsntrick;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get all user tips and tricks
   * @param query
   * @returns
   */
  async findAll(query?: Record<string, any>) {
    try {
      const data = await this.tipsTrickModel.findOne(query);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }
}
