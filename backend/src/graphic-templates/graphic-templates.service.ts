import { url_slug } from 'helpers/common';
import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateGraphicTemplateDto } from './dto/create-graphic-template.dto';
import { UpdateGraphicTemplateDto } from './dto/update-graphic-template.dto';
import { GraphicTemplate } from './graphic-templates.schema';

@Injectable()
export class GraphicTemplatesService {
  constructor(
    @InjectModel(GraphicTemplate.name) private GTModel: Model<GraphicTemplate>,
  ) {}

  async create(createGraphicTemplateDto: CreateGraphicTemplateDto) {
    try {
      const slug = url_slug(createGraphicTemplateDto.name);
      const id = createGraphicTemplateDto?._id || null;
      const findTemplatebyId = await this.GTModel.findById(id);

      if (findTemplatebyId?._id) {
        const template = await this.GTModel.findByIdAndUpdate(id, {
          slug,
          ...createGraphicTemplateDto,
        });
        return template;
      }
      const template = await this.GTModel.create({
        slug,
        ...createGraphicTemplateDto,
      });
      return template;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      const data = await this.GTModel.find()
        .populate(['scene', 'preview', 'createdBy'])
        .where({ trashed: false });
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.GTModel.findById(id)
        .populate(['scene', 'preview', 'createdBy'])
        .where({
          trashed: false,
        });
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  update(id: number, updateGraphicTemplateDto: UpdateGraphicTemplateDto) {
    return `This action updates a #${id} graphicTemplate`;
  }

  async remove(id: string) {
    try {
      const data = await this.GTModel.findByIdAndUpdate(
        id,
        {
          trashed: true,
        },
        {
          upsert: true,
        },
      );
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }
}
