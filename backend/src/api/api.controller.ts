import {
  Controller,
  Get,
  Res,
  HttpStatus,
  Post,
  Headers,
  Param,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { APIService } from './api.service';

import { Response } from 'express';

@Controller({
  path: 'api',
  version: '1',
})
export class APIController {
  constructor(private readonly apiService: APIService) {}

  private async checkAuthorization(headers) {
    if (!headers.authorization || !headers.authorization.includes('Bearer')) {
      throw new Error('Authorization header is required');
    }
    const token = headers.authorization.split(' ')[1];
    const checkToken = await this.apiService.findOneByToken(token);
    if (!checkToken) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
  /**
   * Create an API token
   * @param res
   * @param body
   * @returns
   */
  @Post('/token')
  async createApiToken(@Res() res: Response, @Headers() headers) {
    if (!headers.authorization || !headers.authorization.includes('Basic')) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        data: null,
        message: 'Authorization header is required',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    const authorization = Buffer.from(
      headers.authorization.split(' ')[1],
      'base64',
    )
      .toString()
      ?.split(':');

    try {
      const body = {
        username: authorization[0],
        password: authorization[1],
        createdAt: new Date(),
        type: 'lifetime',
      } as const;
      const data = await this.apiService.createApiToken(body);

      return res.status(HttpStatus.OK).json({
        data,
        message: `Lifetime Token generated.`,
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

  // Get tag copy by business id
  @Get('/businesses/:id/tag-copy')
  async getTagCopyById(
    @Res() res: Response,
    @Headers() headers,
    @Param('id') id: string,
  ) {
    try {
      await this.checkAuthorization(headers);
      const data = await this.apiService.getBusinessTagCopyById(id);
      return res.status(HttpStatus.OK).json({
        data,
        message: `Business tag copies data fetched.`,
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

  // Transform tag copy in text
  @Post('/businesses/:id/tag-copy/transform')
  async transformTagCopyInText(
    @Res() res: Response,
    @Headers() headers,
    @Param('id') id: string,
    @Body() body: Record<string, any>,
  ) {
    try {
      await this.checkAuthorization(headers);
      const text = body?.text;
      if (!text) {
        throw new Error('Text is required to transform tag copy.');
      }
      const data = await this.apiService.transformTagCopyByBusinessId(id, text);
      return res.status(HttpStatus.OK).json({
        data,
        message: `Business tag copies data fetched.`,
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

  // Get one business data by id
  @Get('/businesses/:id')
  async getBusinessById(
    @Res() res: Response,
    @Headers() headers,
    @Param('id') id: string,
  ) {
    try {
      await this.checkAuthorization(headers);
      const data = await this.apiService.getBusinessById(id);
      return res.status(HttpStatus.OK).json({
        data,
        message: `Business data fetched.`,
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
