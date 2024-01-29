import { PartialType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business.dto';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
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
  stripeConfig?: string;
  onboardingCompleted?: boolean;
}
