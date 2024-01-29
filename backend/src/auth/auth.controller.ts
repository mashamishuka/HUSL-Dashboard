import wrap_call_handler from 'helpers/wrap_call_handler';

import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Request,
  Res,
} from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/auth/signature')
  async login(@Request() req) {
    const data = await this.authService.signature(req?.body);
    return data;
  }

  /**
   * This is connected to admin
   * @param req
   * @returns
   */
  @Post('/admin/login')
  async adminLogin(@Request() req) {
    const data = await this.authService.loginAdmin(req?.body);
    return data;
  }

  /**
   * This is connected to accounts module, accounts created by user
   * @param req
   * @returns
   */
  // @Post('/accounts/login')
  // async accountLogin(@Request() req) {
  //   const data = await this.authService.accountLogin(req?.body);
  //   return data;
  // }

  /**
   * This is connected to user module, user created by admin
   * @param req
   * @returns
   */
  @Post('/users/login')
  async userLogin(@Request() req) {
    const data = await this.authService.loginByNft(req?.body);
    return data;
  }

  /**
   * This is connected to user module, user created by admin
   * Login by email & password
   * @param req
   * @returns
   */
  @Post('/auth/login')
  async userCredentialsLogin(@Request() req) {
    const data = await this.authService.authLogin(req?.body);
    return data;
  }

  /**
   * Validate basic auth
   * @returns
   */
  @Get('/auth/validate-basic-auth')
  async validateBasicAuth(@Headers() header, @Req() req, @Res() res) {
    const wrapper = wrap_call_handler({
      action: () => {
        // get x-authorize-token header
        const token = header?.['x-authorize-token'];
        if (!token) {
          throw new BadRequestException('Token is required.');
        }
        return this.authService.validateToken(token);
      },
    });
    wrapper(req, res);
  }
}
