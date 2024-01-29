import { Model } from 'mongoose';

import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name) private settingModel: Model<Setting>,
  ) {}

  async create(createSettingDto: CreateSettingDto) {
    try {
      const existingSetting = await this.settingModel.findOne({
        key: createSettingDto?.key,
      });
      if (existingSetting) {
        // update the existing setting
        return await this.update(createSettingDto?.key, createSettingDto);
        // throw new HttpException(
        //   'Setting exist, please update it instead.',
        //   400,
        // );
      }
      const setting = await this.settingModel.create(createSettingDto);
      return setting;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const data = await this.settingModel.find(query);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(key: string, query?: Record<string, any>) {
    try {
      const data = await this.settingModel.findOne({
        key,
        ...query,
      });
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(key: string, updateSettingDto: UpdateSettingDto) {
    try {
      const existingSetting = await this.settingModel.findOne({
        key,
      });
      if (!existingSetting) {
        throw new HttpException(
          'Setting not found, please create a new one instead.',
          400,
        );
      }
      // remove the key from the update object
      if (updateSettingDto?.key) {
        delete updateSettingDto.key;
      }

      const setting = await this.settingModel.updateOne(
        {
          key,
        },
        updateSettingDto,
      );
      return setting;
    } catch (error) {
      throw new Error(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}
