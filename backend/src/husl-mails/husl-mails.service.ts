import * as CryptoJS from 'crypto-js';
import { Model } from 'mongoose';

import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateEmailConfigDto } from './dto/create-husl-mails.dto';
import { HuslMail } from './husl-mails.schema';
import api from 'helpers/api';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class HuslMailsService {
  huslMailApiUrl: string;
  constructor(
    @InjectModel('huslMails') private huslMailConfig: Model<HuslMail>,
    private userService: UsersService,
  ) {
    this.huslMailApiUrl = 'https://mail.husl.app/api/v1';
  }

  /**
   * This is private method to get the user email configuration, include its token
   * @param userId
   * @returns
   */
  private async getEmailConfig(userId: string) {
    try {
      const config = await this.huslMailConfig
        .findOne({
          user: userId,
        })
        .populate('user');

      if (config?.token) {
        const keyFormula = userId;
        const bytes = CryptoJS.AES.decrypt(config?.token, keyFormula);

        const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
        return {
          token: decryptedToken,
        };
      } else {
        return null;
      }
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  /**
   * Each user should save its configuration in the database before performing each action
   * @param createEmailConfigDto
   * @returns
   */
  async createConfig(createEmailConfigDto: CreateEmailConfigDto) {
    try {
      const user = await this.userService.findOne(createEmailConfigDto?.user);
      if (!user) {
        throw new HttpException('User not found', 404);
      }

      // encrypt the access token
      if (createEmailConfigDto?.token) {
        const keyFormula = createEmailConfigDto?.user;
        createEmailConfigDto.token = CryptoJS.AES.encrypt(
          createEmailConfigDto.token,
          keyFormula,
        ).toString();
      }
      const currentEmailConfig = await this.huslMailConfig.findOne({
        user: createEmailConfigDto.user,
      });
      // if the user already has a configuration, update it
      if (currentEmailConfig) {
        return await this.huslMailConfig.findOneAndUpdate(
          { user: createEmailConfigDto.user },
          createEmailConfigDto,
          { new: true },
        );
      } else {
        return await this.huslMailConfig.create(createEmailConfigDto);
      }
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  async getPublicEmailConfig(userId: string) {
    try {
      const emailConfig = await this.huslMailConfig.findOne({
        user: userId,
      });

      return emailConfig;
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }

  /**
   * Get the user HUSL Mail campaign email list
   */
  async getMailCampaigns(userId: string) {
    try {
      const emailConfig = await this.getEmailConfig(userId);
      const campaigns = await api
        .get(`${this.huslMailApiUrl}/campaigns?api_token=${emailConfig?.token}`)
        .then(({ data }) => data);

      return campaigns;
    } catch (error) {
      throw new HttpException(error, error?.response?.statusCode);
    }
  }
}
