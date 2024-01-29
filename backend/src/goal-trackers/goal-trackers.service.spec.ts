import { Test, TestingModule } from '@nestjs/testing';
import { GoalTrackersService } from './goal-trackers.service';

describe('GoalTrackersService', () => {
  let service: GoalTrackersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoalTrackersService],
    }).compile();

    service = module.get<GoalTrackersService>(GoalTrackersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
