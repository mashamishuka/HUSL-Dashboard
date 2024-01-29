import { Model } from 'mongoose';
import { NichesService } from 'src/niches/niches.service';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Leads } from './leads.schema';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Leads.name) private leadsModel: Model<Leads>,
    private nicheService: NichesService,
  ) {}

  create(createLeadDto: CreateLeadDto) {
    return 'This action adds a new lead';
  }

  async importLeads(nicheId: string, leads: CreateLeadDto[]) {
    try {
      // email are unique, so we need to ignore exist leads with same email in the same niche
      const existLeads = await this.leadsModel.find({
        email: { $in: leads.map((lead) => lead.email) },
        niche: nicheId,
      });
      const existEmails = existLeads.map((lead) => lead.email);
      const newLeads = leads
        .filter((lead) => !existEmails.includes(lead.email))
        .map((lead) => ({ ...lead, niche: nicheId }));
      // create leads
      const createdLeads = await this.leadsModel.insertMany(newLeads);
      return createdLeads;
    } catch (error) {
      throw new Error(error);
    }
  }

  async addNotes(leadsId: string, notes: string) {
    try {
      // get last notes in leads, then merge to a new one
      const leads = await this.leadsModel.findById(leadsId);
      const existingNotes = leads?.notes || [];
      const newNotes = [
        ...existingNotes,
        {
          content: notes,
          createdAt: new Date(),
        },
      ].filter(Object);
      const updatedLeads = await this.leadsModel.findByIdAndUpdate(leadsId, {
        notes: newNotes,
      });
      return updatedLeads;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(query?: Record<string, any>) {
    try {
      const page = Number(query?.page) || 0;
      const limit = Number(query?.limit) || 0;
      const data = await this.leadsModel
        .find(query)
        .sort(query?.sort || {})
        .skip(((page || 0) - 1) * (limit || 0))
        .limit(limit || 0)
        .populate(['business', 'niche']);
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} lead`;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    try {
      const updatedLeads = await this.leadsModel.findByIdAndUpdate(
        id,
        updateLeadDto,
        {
          new: true,
        },
      );
      return updatedLeads;
    } catch (error) {
      throw new Error(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} lead`;
  }

  async countTotalData(query?: Record<string, any>) {
    try {
      const totalData = await this.leadsModel.countDocuments(query);
      return totalData;
    } catch (error) {
      throw new Error(error);
    }
  }
}
