import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { Onboarding } from './onboardings.schema';

@Injectable()
export class OnboardingsService {
  constructor(
    @InjectModel(Onboarding.name) private onboardingModel: Model<Onboarding>,
  ) {}
  async create(createOnboardingDto: CreateOnboardingDto) {
    try {
      const onboarding = await this.onboardingModel.create(createOnboardingDto);
      return onboarding;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const onboardings = await this.onboardingModel
        .find(query)
        .sort({
          order: 'asc',
        })
        .populate('videoAttachment');
      return onboardings;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateOrder(order: string[]) {
    try {
      // update order based on index on order array
      const onboardings = await this.onboardingModel.find();
      const updatedOnboardings = onboardings.map((onboarding) => {
        onboarding.order = order.indexOf(onboarding._id.toString());
        return onboarding;
      });
      await this.onboardingModel.bulkWrite(
        updatedOnboardings.map((onboarding) => ({
          updateOne: {
            filter: { _id: onboarding._id },
            update: { order: onboarding.order },
          },
        })),
      );
      return updatedOnboardings;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: string, query?: Record<string, any>) {
    try {
      const onboardings = await this.onboardingModel
        .findById(id, query)
        .sort({
          order: 'asc',
        })
        .populate('videoAttachment');
      return onboardings;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: string, updateOnboardingDto: UpdateOnboardingDto) {
    try {
      const updatedOnboarding = await this.onboardingModel
        .findByIdAndUpdate(id, updateOnboardingDto)
        .sort({
          order: 'asc',
        })
        .populate('videoAttachment');
      return updatedOnboarding;
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id: string) {
    try {
      const onboarding = await this.onboardingModel.findByIdAndDelete(id);
      return onboarding;
    } catch (error) {
      throw new Error(error);
    }
  }
}
