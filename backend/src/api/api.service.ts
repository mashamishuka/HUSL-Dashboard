import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { BusinessesService } from 'src/businesses/businesses.service';
import { UsersService } from 'src/users/users.service';

import {
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { API } from './api.schema';
import { CreateAPIDto } from './dto/create-api.dto';

@Injectable()
export class APIService {
  constructor(
    @InjectModel(API.name) private apiModel: Model<API>,
    private userService: UsersService,
    private businessService: BusinessesService,
  ) {}

  private generateToken = (length) => {
    //edit the token allowed characters
    const str =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split(
        '',
      );
    const b = [];
    for (let i = 0; i < length; i++) {
      const j = (Math.random() * (str.length - 1)).toFixed(0);
      b[i] = str[j];
    }
    return b.join('');
  };

  // find api token by token
  async findOneByToken(token: string) {
    try {
      const apiToken = await this.apiModel.findOne({ token });
      return apiToken;
    } catch (error) {
      throw new Error(error);
    }
  }
  async createApiToken(createAPIDto: CreateAPIDto) {
    try {
      // check if user is exist
      const identifier = createAPIDto.username;
      const password = createAPIDto.password;
      if (!identifier || !password) {
        throw new NotAcceptableException(
          'identifier and password are required.',
        );
      }
      // find wallet by identifier
      const user = await this.userService.findOneByQuery({
        $or: [{ email: identifier }],
      });
      if (!user) {
        throw new UnauthorizedException('User not found.');
      }
      // if user is not admin, create a temporary token
      if (user.role !== 'admin') {
        createAPIDto.expiresAt = new Date(
          new Date().getTime() + 3 * 24 * 60 * 60 * 1000,
        );
      }
      // check if password is valid
      const isPasswordValid = await bcrypt.compare(password, user?.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid authorization.');
      }

      // generate token
      createAPIDto.token = this.generateToken(32);
      const apiToken = await this.apiModel.create({
        ...createAPIDto,
      });
      return apiToken;
    } catch (error) {
      throw new Error(error);
    }
  }

  // get one business by id
  async getBusinessById(id: string) {
    try {
      const business = await this.businessService.findOne(id);
      return business;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getBusinessTagCopyById(id: string) {
    try {
      const business = await this.businessService.findOne(id);
      const tagCopy = business?.niche?.tagCopy;
      // push to tagCopy
      tagCopy.push(
        {
          key: '[primary color]',
          value: business?.primaryColor,
        },
        {
          key: '[secondary color]',
          value: business?.secondaryColor,
        },
        {
          key: '[name]',
          value: business?.name,
        },
        {
          key: '[domain]',
          value: business?.domain,
        },
        {
          key: '[logo]',
          value: business?.logo?.url,
        },
        {
          key: '[icon]',
          value: business?.favicon?.url,
        },
        {
          key: '[favicon]',
          value: business?.favicon?.url,
        },
      );
      const productMockups = business?.niche?.productMockups;
      let mockups = [];
      productMockups.forEach((productMockup) => {
        // merge mockups
        mockups = [...mockups, ...productMockup.mockups];
      });
      // get only mockups url
      mockups = mockups.map((mockup) => mockup.url);
      // transform mockups to key and value array
      mockups = mockups.map((mockup, i) => {
        return {
          key: `[mockup${i + 1}]`,
          value: mockup,
        };
      });
      // push mockups to tagCopy
      tagCopy.push(...mockups);

      return tagCopy;
    } catch (error) {
      throw new Error(error);
    }
  }

  async transformTagCopyByBusinessId(businessId: string, text: string) {
    try {
      const business = await this.getBusinessTagCopyById(businessId);
      // replace tag copy in text
      business.forEach((tag) => {
        text = text.replace(tag.key, tag.value);
      });
      return text;
    } catch (error) {
      throw new Error(error);
    }
  }
}
