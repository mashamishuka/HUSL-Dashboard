import { Test, TestingModule } from '@nestjs/testing';
import { GAnalyticsService } from './ga-configs.service';

describe('GAnalyticsService', () => {
  let service: GAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GAnalyticsService],
    }).compile();

    service = module.get<GAnalyticsService>(GAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
