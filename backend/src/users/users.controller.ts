import { Request as ExpressRequest, Response } from 'express';
import { removePaginateQuery } from 'helpers/common';
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

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req,
    @Res() res: Response,
  ) {
    try {
      const wallet = req?.user?._id;
      createUserDto.wallet = wallet;
      const account = await this.usersService.create(createUserDto);

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
  @Get()
  async findAll(@Request() req: ExpressRequest, @Res() res: Response) {
    try {
      const user = (req as any)?.user;
      const queries: Record<string, any> = Object.assign({}, req?.query);
      if (user?.role !== 'admin') {
        // deleted user only can be seen by admin
        if (queries?.deleted) {
          delete queries.deleted;
        }
      }
      if (req?.query?._q) {
        // search by name, disable case sensitive
        queries.name = { $regex: req?.query?._q, $options: 'i' };
        delete queries._q;
      }
      // queries.userId = user?._id;
      const metaQuery = removePaginateQuery(queries);

      const data = await this.usersService.findAll(queries as any);
      const totalData = await this.usersService.countTotalData(metaQuery);

      // create pagination object
      const limit = queries?.limit;
      const meta = {
        page: Number(queries?.page) || 1,
        pageCount: limit ? Math.ceil(totalData / limit) : 1,
        limit: limit ? Number(limit) : totalData,
        total: totalData,
      };

      return res.status(HttpStatus.OK).json({
        data,
        meta,
        message: 'Successfully get all users.',
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
  @Get('/stats/client-count')
  async getClientCount(@Request() req: ExpressRequest, @Res() res: Response) {
    try {
      const user = (req as any)?.user;
      const queries: Record<string, any> = Object.assign({}, req?.query);
      if (user?.role !== 'admin') {
        // deleted user only can be seen by admin
        if (queries?.deleted) {
          delete queries.deleted;
        }
      }
      if (req?.query?._q) {
        // search by name, disable case sensitive
        queries.name = { $regex: req?.query?._q, $options: 'i' };
        delete queries._q;
      }

      const data = await this.usersService.getClientCount(queries as any);
      return res.status(HttpStatus.OK).json({
        data,
        message: 'Successfully get all users client count.',
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
  @Get('/nfts')
  async findAllWithNfts(@Request() req: ExpressRequest, @Res() res: Response) {
    try {
      const user = (req as any)?.user;
      const queries = Object.assign({}, req?.query);
      if (user?.role !== 'admin') {
        // deleted user only can be seen by admin
        if (queries?.deleted) {
          delete queries.deleted;
        }
      }
      if (queries?.ids) {
        const nfts = queries?.ids?.toString()?.split(',');
        if (!nfts?.length) {
          throw new Error('Invalid ids query.');
        }
        queries.ids = nfts;
      }
      // const users = await this.usersService.findAll({
      //   ...req?.query,
      //   wallet: walletId,
      // });
      // queries.userId = user?._id;
      const users = await this.usersService.findAllByNfts(queries);
      return res.status(HttpStatus.OK).json({
        data: users,
        message: 'Successfully get all users.',
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
  @Get('/me')
  async findMe(@Res() res: Response, @Request() req: ExpressRequest) {
    try {
      let userId = (req?.user as any)?._id;
      // if it's a member, then we need to return member data instead of owner
      if ((req?.user as any)?.role === 'member') {
        userId = (req?.user as any)?.memberId;
      }
      const user = await this.usersService.findOne(userId, {
        ...req?.query,
      });
      return res.status(HttpStatus.OK).json({
        data: user,
        message: 'Successfully get one user.',
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
  @Get('/permissions/me')
  async findMyPermissions(
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    try {
      let userId = (req?.user as any)?._id;
      // if it's a member, then we need to return member data instead of owner
      if ((req?.user as any)?.role === 'member') {
        userId = (req?.user as any)?.memberId;
      }
      const user = await this.usersService.findUserPermission(userId, {
        ...req?.query,
      });
      return res.status(HttpStatus.OK).json({
        data: user,
        message: 'Successfully get user permission data.',
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
  @Get('/permissions/me/:key')
  async findMyPermissionsByKey(
    @Res() res: Response,
    @Param('key') key: string,
    @Request() req: ExpressRequest,
  ) {
    try {
      let userId = (req?.user as any)?._id;
      // if it's a member, then we need to return member data instead of owner
      if ((req?.user as any)?.role === 'member') {
        userId = (req?.user as any)?.memberId;
      }
      const user = await this.usersService.findUserPermissionByKey(
        userId,
        key,
        {
          ...req?.query,
        },
      );
      return res.status(HttpStatus.OK).json({
        data: user,
        message: 'Successfully get user permission data.',
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
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    try {
      // do we need to check if the user is the owner of the wallet?
      // const walletId = (req as any)?.user?._id;
      const user = await this.usersService.findOne(id, {
        ...req?.query,
      });
      return res.status(HttpStatus.OK).json({
        data: user,
        message: 'Successfully get one user.',
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
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    try {
      const userData: any = req?.user;
      if (userData?.role !== 'admin' && userData?._id !== id) {
        throw new Error("You don't have permission to update this user.");
      }
      const user = await this.usersService.update(id, updateUserDto);

      return res.status(HttpStatus.OK).json({
        data: user,
        message: 'User edited successfully.',
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
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    try {
      const userData: any = req?.user;
      const user = await this.usersService.findOne(userData?._id);
      if (user?.role !== 'admin') {
        throw new Error("You don't have permission to delete this user.");
      } else if (user?._id === id) {
        throw new Error("You can't delete yourself.");
      }

      const targetUser = await this.usersService.remove(id);

      let message = 'User permanently deleted.';
      if ((targetUser as any)?.modifiedCount) {
        message = 'User deleted successfully.';
      }
      return res.status(HttpStatus.OK).json({
        data: targetUser,
        message,
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
  @Patch('/restore/:id')
  async restore(
    @Param('id') id: string,
    @Res() res: Response,
    @Request() req: ExpressRequest,
  ) {
    try {
      const userData: any = req?.user;
      const user = await this.usersService.findOne(userData?._id);
      if (user?.role !== 'admin') {
        throw new Error("You don't have permission to restore this user.");
      }

      const targetUser = await this.usersService.restore(id);

      return res.status(HttpStatus.OK).json({
        data: targetUser,
        message: 'User restored successfully.',
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
