import mongoose, { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Account, AccountsDocument } from './accounts.schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

// import * as CryptoJS from 'crypto-js';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountsDocument>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    try {
      // if (createAccountDto?.password) {
      //   const keyFormula = `${createAccountDto?.username}_${createAccountDto.password}`;
      //   createAccountDto.password = CryptoJS.AES.encrypt(
      //     createAccountDto.password,
      //     keyFormula,
      //   ).toString();
      // }
      // const salt = await bcrypt.genSalt(10);
      // now we set user password to hashed password
      // createdAccount.password = await bcrypt.hash(
      //   createdAccount.password,
      //   salt,
      // );
      return this.accountModel.create(createAccountDto);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Update an account
   * @param accountId
   * @param updateAccountDto
   * @returns
   */
  async update(
    accountId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    try {
      // if (updateAccountDto?.password) {
      //   const keyFormula = `${updateAccountDto?.username}_${updateAccountDto.password}`;
      //   updateAccountDto.password = CryptoJS.AES.encrypt(
      //     updateAccountDto.password,
      //     keyFormula,
      //   ).toString();
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

  async findOne(accountId: string): Promise<Account> {
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
    showPassword = false,
  ): Promise<Account[]> {
    try {
      const query = {
        user: new mongoose.Types.ObjectId(userId),
        ...queries,
        trashed: false,
      };
      let accounts = this.accountModel.find(query);
      if (!showPassword) {
        accounts = accounts.select('-password');
      }

      return await accounts;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * This should be limited to certain role only like superuser/admin
   * @param queries
   * @returns
   */
  async findAll(queries: Record<string, any> = {}): Promise<Account[]> {
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
  async deleteUserAccount(accountId: string, userId: number): Promise<void> {
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
