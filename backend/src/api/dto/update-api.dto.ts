import { PartialType } from '@nestjs/swagger';
import { CreateAPIDto } from './create-api.dto';

export class UpdateAPIDto extends PartialType(CreateAPIDto) {
  products?: string[];
  niches?: string[];
  generate?: boolean;
  domain?: string;
  accounts?: {
    email?: {
      email: string;
      password: string;
    };
  };
  user?: string;
  generated?: boolean;
}
