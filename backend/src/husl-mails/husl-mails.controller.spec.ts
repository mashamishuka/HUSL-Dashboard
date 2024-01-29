import { Test, TestingModule } from '@nestjs/testing';
import { HuslMailController } from './husl-mails.controller';
import { HuslMailsService } from './husl-mails.service';

describe('HuslMailController', () => {
  let controller: HuslMailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HuslMailController],
      providers: [HuslMailsService],
    }).compile();

    controller = module.get<HuslMailController>(HuslMailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
