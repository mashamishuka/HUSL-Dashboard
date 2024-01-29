import { Model } from 'mongoose';
import { BusinessesService } from 'src/businesses/businesses.service';
import { OnboardingsService } from 'src/onboardings/onboardings.service';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateOnboardingProgressDto } from './dto/create-onboarding-progress.dto';
import { UpdateOnboardingProgressDto } from './dto/update-onboarding-progress.dto';
import { OnboardingProgress } from './onboarding-progresses.schema';

@Injectable()
export class OnboardingProgressesService {
  constructor(
    @InjectModel(OnboardingProgress.name)
    private progressModel: Model<OnboardingProgress>,
    private onboardingsService: OnboardingsService,
    private businessService: BusinessesService,
  ) {}

  async saveProgress(createOnboardingProgressDto: CreateOnboardingProgressDto) {
    try {
      const progress = new this.progressModel(createOnboardingProgressDto);
      return progress.save();
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const progress = this.progressModel.find(query);
      // check if there is a new onboarding, if yes, then update business to set the status to false
      const onboardings = await this.onboardingsService.findAll();
      let q: any = {
        business: query.business,
        completed: true,
      };
      // or user query
      if (query?.user) {
        q = {
          ...q,
          $or: [{ user: query?.user }, { user: null }],
        };
      }

      // find completed onboardings progress
      const completedOnboardings = await this.progressModel.find(q);
      // check if there is a new onboarding
      if (onboardings.length > completedOnboardings.length) {
        // update business to set the status to false
        await this.businessService.update(query.business, {
          onboardingCompleted: false,
        });
      }

      return progress;
    } catch (error) {
      throw new Error(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} onboardingProgress`;
  }

  update(id: number, updateOnboardingProgressDto: UpdateOnboardingProgressDto) {
    return `This action updates a #${id} onboardingProgress`;
  }

  remove(id: number) {
    return `This action removes a #${id} onboardingProgress`;
  }
}
