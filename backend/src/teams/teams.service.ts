import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/edit-member.dto';
import { Team, TeamsDocument } from './teams.schema';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamsDocument>,
    private userService: UsersService,
  ) {}

  /**
   * Create a new team member and add to the team
   * @param AddMemberDto
   * @returns
   */
  async createTeamMember(createTeamDto: AddMemberDto) {
    try {
      // find or create a new team based on userId/owner
      let team = await this.teamModel
        .findOne({
          owner: createTeamDto.owner,
        })
        .populate('members');
      if (!team) {
        team = await this.teamModel.create({
          owner: createTeamDto.owner,
          members: [createTeamDto.owner],
        });
      }
      // get owner user detail
      const owner = await this.userService.findOne(createTeamDto.owner);
      // if there is no team in user, add team to user
      if (!owner.team) {
        await this.userService.update(owner?._id, {
          team: team._id,
        });
      }
      // check if user already in the team
      const isMember = team.members.find(
        (member) => member?.email === createTeamDto.email,
      );
      if (isMember) {
        throw new Error('User already in the team');
      }
      // create a new member/user and add to the team
      const user = await this.userService.create({
        email: createTeamDto.email,
        name: createTeamDto.name,
        password: createTeamDto.password,
        permissions: createTeamDto.permissions,
        role: 'member',
        team: team._id,
      });
      // add new member to the team
      team.members.push(user._id);
      await team.save();
      // return user detail
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getTeamMember(query?: Record<string, any>) {
    try {
      const team = await this.teamModel
        .findOne({
          owner: query?.owner,
        })
        .populate('members', '-password');
      return team;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateTeamMember(memberId: string, body?: UpdateMemberDto) {
    try {
      const team = await this.teamModel
        .findOne({
          owner: body?.owner,
          // check if memberId is in the members array
          members: { $in: [memberId] },
        })
        .populate('members', '-password');
      if (!team) {
        throw new UnauthorizedException('Team not found');
      }
      // update user detail
      const user = await this.userService.update(memberId, body, true);
      // return user detail
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteTeamMember(memberId: string, query?: Record<string, any>) {
    try {
      const team = await this.teamModel
        .findOne({
          owner: query?.owner,
          // check if memberId is in the members array
          members: { $in: [memberId] },
        })
        .populate('members', '-password');
      if (!team) {
        throw new UnauthorizedException('Team not found');
      }
      // get user detail
      const user = await this.userService.findOne(memberId);
      // remove user from the team if role is member
      if (user?.role === 'member') {
        team.members = team.members.filter(
          (member) => (member as any)?._id?.toString() !== memberId,
        );
        await team.save();
        // remove user
        await this.userService.remove(memberId, true);
      }
      // return user detail
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} team`;
  }

  update(id: number) {
    return `This action updates a #${id} team`;
  }

  remove(id: number) {
    return `This action removes a #${id} team`;
  }
}
