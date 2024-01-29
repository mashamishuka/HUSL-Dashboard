import { Test, TestingModule } from '@nestjs/testing';
import { GoalTrackersController } from './goal-trackers.controller';
import { GoalTrackersService } from './goal-trackers.service';

describe('GoalTrackersController', () => {
  let controller: GoalTrackersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalTrackersController],
      providers: [GoalTrackersService],
    }).compile();

    controller = module.get<GoalTrackersController>(GoalTrackersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
