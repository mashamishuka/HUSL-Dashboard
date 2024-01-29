import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingProgressesService } from './onboarding-progresses.service';

describe('OnboardingProgressesService', () => {
  let service: OnboardingProgressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnboardingProgressesService],
    }).compile();

    service = module.get<OnboardingProgressesService>(OnboardingProgressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
