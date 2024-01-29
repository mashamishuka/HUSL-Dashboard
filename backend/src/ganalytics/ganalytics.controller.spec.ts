import { Test, TestingModule } from '@nestjs/testing';
import { GAnalyticsController } from './ganalytics.controller';
import { GAnalyticsService } from './ganalytics.service';

describe('GAnalyticsController', () => {
  let controller: GAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GAnalyticsController],
      providers: [GAnalyticsService],
    }).compile();

    controller = module.get<GAnalyticsController>(GAnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
