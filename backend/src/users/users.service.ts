import * as bcrypt from 'bcrypt';
import { filterSubscriptionByMetadata } from 'helpers/stripe';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { FinancesService } from 'src/finances/finances.service';

import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { forwardRef } from '@nestjs/common/utils';
import { InjectModel } from '@nestjs/mongoose';

import { getStripeSubscription } from '../../helpers/stripeAPI';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UsersDocument } from './users.schema';

@Injectable()
export class UsersService {
  private secretKey: string;

  constructor(
    @InjectModel(User.name) private userModel: Model<UsersDocument>,
    @Inject(forwardRef(() => FinancesService))
    private financeService: FinancesService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.nftId) {
        // make sure nft id is unique
        const existingUser = await this.userModel.findOne({
          nftId: createUserDto.nftId,
        });
        if (existingUser) {
          throw new Error('NFT ID already exists.');
        }
      }
      // if there is no nftId but only email
      if (!createUserDto.nftId && createUserDto.email) {
        // make sure email is unique
        const existingUser = await this.userModel.findOne({
          email: createUserDto.email,
        });
        if (existingUser) {
          throw new Error('Email already exists.');
        }
      }

      if (createUserDto.password) {
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        const newPassword = await bcrypt.hash(createUserDto.password, salt);
        createUserDto.password = newPassword;
      }

      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
      // if all is okay, we add a company for the user
      // if (user && !user?.company) {
      //   const company = await this.companiesService.create({
      //     user: user._id,
      //   });
      //   // if company is created, we add the company to the user
      //   if (company) {
      //     await user.updateOne({ company: company._id });
      //   }
      // }
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Validate Basic Auth
   */
  async validateBasicAuth(nftId: string, password: string) {
    const user = await this.userModel.findOne({ nftId });
    if (!user) {
      throw new Error('InvalidCredentials');
    }
    // if user has no password
    if (!user?.password) {
      return false;
    }
    const { password: pw }: User = Object.assign(user)?.toObject();
    // check if password is valid
    const isPasswordCorrect = await bcrypt.compare(password, pw);
    if (!isPasswordCorrect) {
      throw new Error('InvalidCredentials');
    }
    return user;
  }

  /**
   * Find all users
   * @returns
   */
  async findAll(queries: Record<string, any> = {}) {
    try {
      const query: Record<string, any> = {
        deleted: false,
        ...queries,
      };
      const page = Number(query?.page) || 0;
      const limit = Number(query?.limit) || 0;
      // blacklist query
      delete query?.password;
      delete query?.__v;
      delete query?.page;
      delete query?.limit;

      // get clients
      if (query?.clients == 'true') {
        const config = await this.financeService.getStripeConfig(
          queries?.userId,
        );
        const subscription = await getStripeSubscription(config, {
          unixMin: moment().subtract(5, 'years').startOf('year').unix(),
          unixMax: moment().unix(),
        });
        const stripeConfig = await this.financeService.findAll();
        // remove query?.clients
        delete query?.clients;
        const U = await this.userModel
          .find(query)
          .select('-password')
          .populate('accounts', [
            'username',
            'websiteKey',
            'verified',
            'createdBy',
          ])
          .populate(['profilePicture', 'business']);
        const usersWithClients = U?.map((user) => {
          const builderName = stripeConfig.find(
            (config) =>
              (config.user as any)?._id?.toString() === user._id?.toString(),
          )?.whitelabelTag;
          const customers = filterSubscriptionByMetadata(
            subscription,
            builderName,
          );
          const clients = customers?.length;
          // if (query?.hasCustomer == 'true' && !clients) return null;
          return {
            ...user.toJSON(),
            clients,
          };
        }).filter(Boolean);
        // create a skip and limit using js
        if (page && limit) {
          const skip = (page - 1) * limit;
          const end = skip + limit;
          return usersWithClients.slice(skip, end);
        }

        return usersWithClients;
      }
      const users = this.userModel
        .find(query)
        .select('-password')
        .populate('accounts', [
          'username',
          'websiteKey',
          'verified',
          'createdBy',
        ])
        .populate(['profilePicture', 'business'])
        .sort(query?.sort || {})
        .skip(((page || 0) - 1) * (limit || 0))
        .limit(limit || 0);

      return users;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Get user clients
   * @param queries
   * @returns
   */
  async getClientCount(queries: Record<string, any> = {}) {
    try {
      // sum all clients in the users
      const users = await this.findAll(queries);
      const config = await this.financeService.getStripeConfig(queries?.userId);
      const subscription = await getStripeSubscription(config, {
        unixMin: moment().subtract(5, 'years').startOf('year').unix(),
        unixMax: moment().unix(),
      });
      const stripeConfig = await this.financeService.findAll();
      const usersWithClients = users
        ?.map((user) => {
          const builderName = stripeConfig.find(
            (config) =>
              (config.user as any)?._id?.toString() === user._id?.toString(),
          )?.whitelabelTag;
          const customers = filterSubscriptionByMetadata(
            subscription,
            builderName,
          );
          const clients = customers?.length;
          return {
            ...user.toJSON(),
            clients,
          };
        })
        .filter(Boolean);
      return usersWithClients.reduce((acc, user) => acc + user.clients, 0);
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAllByNfts(queries: Record<string, any> = {}) {
    try {
      const query: Record<string, any> = {
        deleted: false,
        ...queries,
      };
      // blacklist query
      delete query?.password;
      delete query?.__v;

      if (query?.ids) {
        // if nftId is one of the query.ids
        query.nftId = { $in: query.ids };
        delete query.ids;
      }

      const users = await this.userModel
        .find(query)
        // nftId is string, check if nftIds above is match saved nftId
        .select(['nftId', 'name', 'websiteKey']);
      // get clients
      if (query?.clients == 'true') {
        const config = await this.financeService.getStripeConfig(
          queries?.userId,
        );
        const subscription = await getStripeSubscription(config, {
          unixMin: moment().subtract(5, 'years').startOf('year').unix(),
          unixMax: moment().unix(),
        });
        const stripeConfig = await this.financeService.findAll();
        const usersWithClients = users?.map((user) => {
          const builderName = stripeConfig.find(
            (config) =>
              (config.user as any)?._id?.toString() === user._id?.toString(),
          )?.whitelabelTag;
          const customers = filterSubscriptionByMetadata(
            subscription,
            builderName,
          );
          const clients = customers?.length;
          return {
            ...user.toJSON(),
            clients,
          };
        });
        return usersWithClients;
      }

      return users;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Find user by id
   * @param id
   * @returns
   */
  async findOne(id: string, queries: Record<string, any> = {}) {
    try {
      const query: Record<string, any> = {
        ...queries,
        deleted: false,
      };
      let user = await this.userModel
        .findOne({
          _id: id,
          ...query,
        })
        .populate({
          path: 'team',
          populate: ['owner'],
        });
      // if user is a member, then get owner data
      if (user?.role === 'member') {
        const owner = await this.userModel
          .findOne({
            _id: (user?.team?.owner as any)?._id,
            ...query,
          })
          .populate('accounts', [
            'username',
            'websiteKey',
            'verified',
            'createdBy',
          ])
          .populate(['profilePicture', 'business'])
          .populate({
            path: 'team',
            populate: ['owner'],
          });
        // merge owner data to user
        user = {
          ...owner?.toObject(),
          _id: owner?._id,
          name: user?.name,
          email: user?.email,
          role: user?.role,
        } as any;
      } else {
        user = await this.userModel
          .findOne({
            _id: id,
            ...query,
          })
          .populate('accounts', [
            'username',
            'websiteKey',
            'verified',
            'createdBy',
          ])
          .populate(['profilePicture', 'business'])
          .populate({
            path: 'team',
            populate: ['owner'],
          });
        user = user?.toObject();
      }

      // if user is not setting the password yet, then we add a new object to tell the user to set the password
      if (!user?.password) {
        (user as any).noPassword = true;
      }
      // remove password from user
      delete user?.password;

      // get clients
      if (query?.clients == 'true') {
        const config = await this.financeService.getStripeConfig(id);
        const subscription = await getStripeSubscription(config, {
          unixMin: moment().subtract(5, 'years').startOf('year').unix(),
          unixMax: moment().unix(),
        });
        const stripeConfig = await this.financeService.findAll();
        const builderName = stripeConfig.find(
          (config) =>
            (config.user as any)?._id?.toString() === user._id?.toString(),
        )?.whitelabelTag;
        const customers = filterSubscriptionByMetadata(
          subscription,
          builderName,
        );
        const clients = customers?.length;
        if (query?.hasCustomer == 'true' && !clients) return null;
        return {
          ...user?.toObject(),
          clients,
        } as User & {
          _id: string;
          id: string;
        };
      }

      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Find user permission
   * @param id
   * @returns
   */
  async findUserPermission(id: string, queries: Record<string, any> = {}) {
    try {
      const query: Record<string, any> = {
        ...queries,
        deleted: false,
      };
      const user = await this.userModel
        .findOne({
          _id: id,
          ...query,
        })
        .select('permissions');
      // if user is a not a member, then we allow all rss permission if there is no rss permission
      if (user?.role !== 'member') {
        if (!user?.permissions || !user?.permissions?.length) {
          user.permissions = ['all'];
        }
      }

      return user?.permissions || [];
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Find user permission by key
   * @param id
   * @returns
   */
  async findUserPermissionByKey(
    id: string,
    key: string,
    queries: Record<string, any> = {},
  ) {
    try {
      const permissions = await this.findUserPermission(id, queries);
      // if it has all permissions, then return true
      if (permissions?.includes('all')) return true;

      const hasPermission = permissions?.find((permission) =>
        permission.includes(key),
      );
      return !!hasPermission;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Find one by query
   * @param id
   * @returns
   */
  async findOneByQuery(queries: Record<string, any> = {}) {
    try {
      const query = {
        ...queries,
        deleted: false,
      };
      const user = await this.userModel
        .findOne(query)
        .populate('accounts', [
          'username',
          'websiteKey',
          'verified',
          'createdBy',
        ])
        .populate(['profilePicture', 'business'])
        .populate({
          path: 'team',
          populate: ['owner'],
        });
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Find user by id
   * @param id
   * @returns
   */
  async findOneByNFT(nftId: string, queries: Record<string, any> = {}) {
    try {
      const query = {
        ...queries,
        deleted: false,
      };
      const user = await this.userModel
        .findOne({
          nftId,
          ...query,
        })
        .select('-password')
        .populate('accounts', [
          'username',
          'websiteKey',
          'verified',
          'createdBy',
        ])
        .populate(['profilePicture', 'business']);
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOneByFoundersCard(
    foundersCard: string,
    queries: Record<string, any> = {},
  ) {
    try {
      const query = {
        foundersCard: foundersCard,
        ...queries,
        deleted: false,
      };
      const user = await this.userModel
        .findOne({
          foundersCard: foundersCard,
          ...query,
        })
        .select('-password')
        .populate('accounts', [
          'username',
          'websiteKey',
          'verified',
          'createdBy',
        ])
        .populate(['profilePicture', 'business']);
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Update user by id
   * @param id
   * @param updateUserDto
   * @returns
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    directChangePass?: boolean,
  ): Promise<User> {
    try {
      // if a new password setted
      if (updateUserDto?.newPassword) {
        // check if current password is correct
        const user = await this.userModel.findOne({ _id: id });
        if (!user) {
          throw new Error('User not found.');
        }
        const { password: pw }: User = Object.assign(user)?.toObject();

        // if there is password, we check if current password is correct
        if (pw && !directChangePass) {
          // check if password is valid
          const isPasswordCorrect = await bcrypt.compare(
            updateUserDto?.currentPassword,
            pw,
          );
          if (!isPasswordCorrect) {
            throw new Error('Current password is incorrect.');
          }
        }

        // if current password is correct, we update the password
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        const newPassword = await bcrypt.hash(updateUserDto.newPassword, salt);
        updateUserDto.password = newPassword;
      }

      const user = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, {
          new: true,
          deleted: false,
        })
        .select('-password');

      return user;
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  /**
   * Delete user by id
   * @param id
   * @returns
   */
  async remove(id: string, hardDelete = false) {
    try {
      // check if user is deleted the account
      const user = await this.userModel.findOne({ _id: id });
      if (!user) {
        throw new Error('User not found.');
      }
      // if user already deleted, we permanently delete the user
      if (user?.deleted || hardDelete) {
        return this.userModel.deleteOne({ _id: id });
      } else {
        // if user is not deleted, we soft delete the user
        return this.userModel.updateOne({ _id: id }, { deleted: true });
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Restore user by id (soft deleted user)
   */
  async restore(id: string) {
    try {
      const user = await this.userModel.findOne({ _id: id });
      if (!user) {
        throw new Error('User not found.');
      }
      // if user is not deleted, we throw an error
      if (!user?.deleted) {
        throw new Error('User is not deleted.');
      }
      // if user is deleted, we restore the user
      return this.userModel.updateOne({ _id: id }, { deleted: false });
    } catch (error) {
      throw new Error(error);
    }
  }

  async countTotalData(query?: Record<string, any>) {
    try {
      const totalData = await this.userModel.countDocuments(query).where({
        $or: [{ deleted: false }, { deleted: { $exists: false } }],
      });
      return totalData;
    } catch (error) {
      throw new Error(error);
    }
  }
}
