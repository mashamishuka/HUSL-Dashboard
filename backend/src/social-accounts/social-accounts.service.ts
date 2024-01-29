import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateAccountDto } from './dto/create-social-account.dto';
import { UpdateAccountDto } from './dto/update-social-account.dto';
import {
  SocialAccount,
  SocialAccountsDocument,
} from './social-accounts.schema';

@Injectable()
export class SocialAccountsService {
  constructor(
    @InjectModel(SocialAccount.name)
    private accountModel: Model<SocialAccountsDocument>,
    private userService: UsersService,
  ) {}

  async create(
    createAccountDto: CreateAccountDto,
  ): Promise<SocialAccount | SocialAccount[]> {
    try {
      const user = await this.userService.findOne(createAccountDto.user);
      if (!user) {
        throw new Error('User not found');
      }
      const userBusiness = user.business?.map((v) => (v as any)._id);
      const createdAccount = new this.accountModel(createAccountDto);
      // if user business is not empty
      if (userBusiness?.length) {
        const response: SocialAccount[] = [];
        // loop business and create account for each business
        for (const business of userBusiness) {
          const account = new this.accountModel(createAccountDto);
          account.business = business;
          const acc = await account.save();
          response.push(acc);
        }
        return response;
      }
      // const salt = await bcrypt.genSalt(10);
      // // now we set user password to hashed password
      // createdAccount.password = await bcrypt.hash(
      //   createdAccount.password,
      //   salt,
      // );
      // default verified to false
      createdAccount.verified = false;
      return createdAccount.save();
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Update a social account
   * @param accountId
   * @param updateAccountDto
   * @returns
   */
  async update(
    accountId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<SocialAccount> {
    try {
      // if (updateAccountDto?.password) {
      //   const salt = await bcrypt.genSalt(10);
      //   // now we set user password to hashed password
      //   updateAccountDto.password = await bcrypt.hash(
      //     updateAccountDto.password,
      //     salt,
      //   );
      // }
      const account = await this.accountModel.findByIdAndUpdate(
        accountId,
        updateAccountDto,
        { new: true },
      );

      return account;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(accountId: string): Promise<SocialAccount> {
    try {
      const account = await this.accountModel.findById(accountId);

      return account;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAllUserAccounts(
    userId: string,
    queries: Record<string, any> = {},
  ): Promise<SocialAccount[]> {
    try {
      const query: Record<string, any> = {
        user: userId,
        trashed: false,
        ...queries,
      };
      const businessId = queries?.businessId;
      if (businessId) {
        // or query for business
        query.$or = [{ business: businessId }, { business: null }];
      }
      delete query?.businessId;
      const accounts = await this.accountModel.find(query);

      return accounts;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAccountByBusiness(
    businessId: string,
    queries: Record<string, any> = {},
  ): Promise<SocialAccount[]> {
    try {
      const query = {
        business: businessId,
        trashed: false,
        ...queries,
      };
      const accounts = await this.accountModel.find(query);

      return accounts;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * This should be limited to certain role only like superuser/admin
   * @param queries
   * @returns
   */
  async findAll(queries: Record<string, any> = {}): Promise<SocialAccount[]> {
    try {
      const query = {
        ...queries,
        trashed: false,
      };
      const accounts = await this.accountModel.find(query).populate('user');

      return accounts;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Delete user account
   */
  async deleteUserSocialAccount(
    accountId: string,
    userId: number,
  ): Promise<void> {
    try {
      const account = await this.accountModel.findOne({
        _id: accountId,
        user: userId,
      });
      if (account?.trashed) {
        return await this.accountModel.findByIdAndDelete(accountId);
      } else {
        return await this.accountModel.findByIdAndUpdate(accountId, {
          trashed: true,
        });
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
