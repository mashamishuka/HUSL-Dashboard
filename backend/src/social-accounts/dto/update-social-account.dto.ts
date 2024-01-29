import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-social-account.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  websiteKey?: string;
  username?: string;
  password?: string;
  verified?: boolean;
}
