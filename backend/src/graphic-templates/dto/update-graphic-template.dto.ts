import { PartialType } from '@nestjs/swagger';
import { CreateGraphicTemplateDto } from './create-graphic-template.dto';

export class UpdateGraphicTemplateDto extends PartialType(CreateGraphicTemplateDto) {}
