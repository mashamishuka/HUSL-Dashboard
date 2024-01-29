import { PartialType } from '@nestjs/swagger';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  name?: string;
  company?: string;
  currentPassword?: string;
  newPassword?: string;
  password?: string;
  profilePicture?: string;
  foundersCard?: string;
  permissions?: string[];
  lastLogin?: number;
  socialConnectorAddress?: string;
  cosialConnectorEmail?: string;
}
