import { Test, TestingModule } from '@nestjs/testing';
import { HuslMailsService } from './husl-mails.service';

describe('HuslMailsService', () => {
  let service: HuslMailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HuslMailsService],
    }).compile();

    service = module.get<HuslMailsService>(HuslMailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
