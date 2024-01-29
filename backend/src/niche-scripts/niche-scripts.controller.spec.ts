import { Test, TestingModule } from '@nestjs/testing';
import { NicheScriptsController } from './niche-scripts.controller';
import { NicheScriptsService } from './niche-scripts.service';

describe('NicheScriptsController', () => {
  let controller: NicheScriptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NicheScriptsController],
      providers: [NicheScriptsService],
    }).compile();

    controller = module.get<NicheScriptsController>(NicheScriptsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
