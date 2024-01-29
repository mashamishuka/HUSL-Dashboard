import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export const errorHandler = (res: Response, error: any) => {
  return res.status(error?.response?.status || HttpStatus.BAD_REQUEST).json({
    data: null,
    message:
      error?.response?.message ||
      error?.response?.response?.message ||
      error?.message,
    status: error?.response?.status || HttpStatus.BAD_REQUEST,
  });
};
