import { Test, TestingModule } from '@nestjs/testing';
import { APIController } from './api.controller';
import { APIService } from './api.service';

describe('APIController', () => {
  let controller: APIController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [APIController],
      providers: [APIService],
    }).compile();

    controller = module.get<APIController>(APIController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
