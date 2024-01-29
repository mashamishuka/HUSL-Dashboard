import { Test, TestingModule } from '@nestjs/testing';
import { NotficationsController } from './notifications.controller';
import { NotificatiosService } from './notifications.service';

describe('RewardsController', () => {
  let controller: NotficationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotficationsController],
      providers: [NotificatiosService],
    }).compile();

    controller = module.get<NotficationsController>(NotficationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
