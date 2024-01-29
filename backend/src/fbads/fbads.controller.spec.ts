import { Test, TestingModule } from '@nestjs/testing';
import { FbadsController } from './fbads.controller';
import { FbadsService } from './fbads.service';

describe('FbadsController', () => {
  let controller: FbadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FbadsController],
      providers: [FbadsService],
    }).compile();

    controller = module.get<FbadsController>(FbadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
