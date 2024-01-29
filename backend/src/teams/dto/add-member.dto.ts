import { CreateUserDto } from 'src/users/dto/create-user.dto';

import { PartialType } from '@nestjs/mapped-types';

export class AddMemberDto extends PartialType(CreateUserDto) {
  owner: string;
}
