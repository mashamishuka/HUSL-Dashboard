import { Test, TestingModule } from '@nestjs/testing';
import { TipsntrickController } from './tipsntricks.controller';
import { TipsntrickService } from './tipsntricks.service';

describe('TipsntrickController', () => {
  let controller: TipsntrickController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipsntrickController],
      providers: [TipsntrickService],
    }).compile();

    controller = module.get<TipsntrickController>(TipsntrickController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
