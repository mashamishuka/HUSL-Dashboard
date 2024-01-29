export class CreateOnboardingProgressDto {
  business: string;
  user: string;
  onboarding: string;
  status: 'pending' | 'completed' | 'skiped';
}
