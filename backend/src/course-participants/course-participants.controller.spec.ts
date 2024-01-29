import { Test, TestingModule } from '@nestjs/testing';
import { CourseParticipantsController } from './course-participants.controller';
import { CourseParticipantsService } from './course-participants.service';

describe('CourseParticipantsController', () => {
  let controller: CourseParticipantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseParticipantsController],
      providers: [CourseParticipantsService],
    }).compile();

    controller = module.get<CourseParticipantsController>(CourseParticipantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
