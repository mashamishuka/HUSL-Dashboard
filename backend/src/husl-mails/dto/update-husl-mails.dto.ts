import { PartialType } from '@nestjs/swagger';
import { CreateEmailConfigDto } from './create-husl-mails.dto';

export class UpdateEmailConfigDto extends PartialType(CreateEmailConfigDto) {}
