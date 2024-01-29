import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateNicheScriptDto } from './dto/create-niche-script.dto';
import { UpdateNicheScriptDto } from './dto/update-niche-script.dto';
import { NicheScript } from './niche-scripts.schema';

@Injectable()
export class NicheScriptsService {
  constructor(
    @InjectModel(NicheScript.name) private nicheScriptModel: Model<NicheScript>,
  ) {}
  create(createNicheScriptDto: CreateNicheScriptDto) {
    try {
      // create new niche script
      const newNicheScript = new this.nicheScriptModel(createNicheScriptDto);
      return newNicheScript.save();
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const data = await this.nicheScriptModel
        .find(query)
        .sort(query?.sort || {})
        .populate(['niche']);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} nicheScript`;
  }

  update(id: number, updateNicheScriptDto: UpdateNicheScriptDto) {
    return `This action updates a #${id} nicheScript`;
  }

  async remove(id: string) {
    try {
      const data = await this.nicheScriptModel.findByIdAndDelete(id);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }
}
