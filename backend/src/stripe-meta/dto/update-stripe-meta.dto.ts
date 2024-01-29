import { PartialType } from '@nestjs/swagger';
import { CreateStripeMetaDto } from './create-stripe-meta.dto';

export class UpdateStripeMetaDto extends PartialType(CreateStripeMetaDto) {}
