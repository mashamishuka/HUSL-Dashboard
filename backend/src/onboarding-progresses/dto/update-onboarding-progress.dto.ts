import { PartialType } from '@nestjs/swagger';
import { CreateOnboardingProgressDto } from './create-onboarding-progress.dto';

export class UpdateOnboardingProgressDto extends PartialType(CreateOnboardingProgressDto) {}
