import { Test, TestingModule } from '@nestjs/testing';
import { GAnalyticsConfigController } from './ga-configs.controller';
import { GAnalyticsConfigService } from './ga-configs.service';

describe('GAnalyticsConfigController', () => {
  let controller: GAnalyticsConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GAnalyticsConfigController],
      providers: [GAnalyticsConfigService],
    }).compile();

    controller = module.get<GAnalyticsConfigController>(
      GAnalyticsConfigController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
