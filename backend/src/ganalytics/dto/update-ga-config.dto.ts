import { PartialType } from '@nestjs/swagger';
import { CreateGaConfigDto } from './create-ga-config.dto';

export class UpdateGaConfigDto extends PartialType(CreateGaConfigDto) {}
