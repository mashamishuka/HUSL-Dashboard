import { PartialType } from '@nestjs/swagger';
import { CreateNicheScriptDto } from './create-niche-script.dto';

export class UpdateNicheScriptDto extends PartialType(CreateNicheScriptDto) {}
