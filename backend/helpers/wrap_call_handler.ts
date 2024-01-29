import { Request as ExpressRequest, Response } from 'express';

import { HttpStatus, UnauthorizedException } from '@nestjs/common';

export default function wrap_call_handler({
  action,
  requires_admin = false,
}: {
  action: (arg0: any) => Promise<any>;
  requires_admin?: boolean;
}) {
  return async (req: ExpressRequest, res: Response) => {
    try {
      const user: any = req?.user;
      const userId = user?._id;

      if (requires_admin) {
        if (user?.role !== 'admin') {
          throw new UnauthorizedException('Unauthorized');
        }
      }

      const data = await action({ userId, user, req, res });

      return res.status(HttpStatus.OK).json({
        data,
        message: `Successfully called ${req.route.path}`,
        status: HttpStatus.OK,
      });
    } catch (error) {
      return res
        .status(error?.response?.statusCode || HttpStatus.BAD_REQUEST)
        .json({
          data: null,
          message: error?.response?.message || error?.message,
          status: error?.response?.statusCode || HttpStatus.BAD_REQUEST,
        });
    }
  };
}
