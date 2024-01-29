import { PartialType } from '@nestjs/swagger';
import { CreateStripeCustomerDto } from './create-stripe-customer.dto';

export class UpdateStripeCustomerDto extends PartialType(CreateStripeCustomerDto) {}
