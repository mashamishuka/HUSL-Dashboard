import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingProgressesController } from './onboarding-progresses.controller';
import { OnboardingProgressesService } from './onboarding-progresses.service';

describe('OnboardingProgressesController', () => {
  let controller: OnboardingProgressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingProgressesController],
      providers: [OnboardingProgressesService],
    }).compile();

    controller = module.get<OnboardingProgressesController>(OnboardingProgressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
