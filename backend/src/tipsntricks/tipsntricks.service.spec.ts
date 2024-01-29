import { Test, TestingModule } from '@nestjs/testing';
import { TipsntrickService } from './tipsntricks.service';

describe('TipsntrickService', () => {
  let service: TipsntrickService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipsntrickService],
    }).compile();

    service = module.get<TipsntrickService>(TipsntrickService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
