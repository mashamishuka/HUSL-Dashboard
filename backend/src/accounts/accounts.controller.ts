import { Request as ExpressRequest, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private authService: AuthService,
  ) {}

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
      const account = await this.accountsService.create(createAccountDto);

      // remove password field
      // if (account?.password) {
      //   delete account.password;
      // }
      return res.status(HttpStatus.CREATED).json({
        data: account,
        message: 'Account created successfully.',
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
        message: 'Account updated successfully.',
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
    @Headers() headers: Record<string, string>,
  ) {
    try {
      const userId = (req as any)?.user?._id;
      let showPassword = false;
      // validate x-authorize-token header
      if (headers?.['x-authorize-token']) {
        const token = headers?.['x-authorize-token'];
        const validated = await this.authService.validateToken(token);
        if (validated) {
          showPassword = true;
        }
      }
      const accounts = await this.accountsService.findAllUserAccounts(
        userId,
        req?.query,
        showPassword,
      );
      return res.status(HttpStatus.OK).json({
        data: accounts,
        message: 'Successfully get all accounts.',
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
  async deleteAccount(
    @Param() params,
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    try {
      const accountId = params?.id;
      const userId = (req as any)?.user?._id;
      const deleteAccount = await this.accountsService.deleteUserAccount(
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
