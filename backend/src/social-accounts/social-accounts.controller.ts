import { Request as ExpressRequest, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';

import { CreateAccountDto } from './dto/create-social-account.dto';
import { UpdateAccountDto } from './dto/update-social-account.dto';
import { SocialAccountsService } from './social-accounts.service';

@Controller('social-accounts')
export class SocialAccountsController {
  constructor(private readonly accountsService: SocialAccountsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @Request() req,
    @Res() res: Response,
  ) {
    try {
      const user = req?.user?._id;
      createAccountDto.user = user;
      const account: any = await this.accountsService.create(createAccountDto);

      // remove password field
      if (account?.length > 0) {
        account.map((v) => {
          delete v?.password;
        });
      } else {
        if (account?.password) {
          delete account.password;
        }
      }
      return res.status(HttpStatus.CREATED).json({
        data: account,
        message: 'Social account created successfully.',
        status: HttpStatus.CREATED,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Body() updateAccountDto: UpdateAccountDto,
    @Param() params,
    @Res() res: Response,
  ) {
    try {
      const account = await this.accountsService.update(
        params?.id,
        updateAccountDto,
      );

      return res.status(HttpStatus.CREATED).json({
        data: account,
        message: 'Social account updated successfully.',
        status: HttpStatus.CREATED,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAllUserAccounts(
    @Request() req: ExpressRequest,
    @Res() res: Response,
  ) {
    try {
      const userId = (req as any)?.user?._id;
      const accounts = await this.accountsService.findAllUserAccounts(
        userId,
        req?.query,
      );
      return res.status(HttpStatus.OK).json({
        data: accounts,
        message: 'Successfully get all social accounts.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param() params, @Res() res: Response) {
    try {
      const accountId = params?.id;
      const account = await this.accountsService.findOne(accountId);
      return res.status(HttpStatus.OK).json({
        data: account,
        message: 'Successfully get the account.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSocialAccount(
    @Param() params,
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    try {
      const accountId = params?.id;
      const userId = (req as any)?.user?._id;
      const deleteAccount = await this.accountsService.deleteUserSocialAccount(
        accountId,
        userId,
      );
      return res.status(HttpStatus.OK).json({
        data: deleteAccount,
        message: 'Successfully delete the account.',
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: error?.response?.message || error?.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
}
