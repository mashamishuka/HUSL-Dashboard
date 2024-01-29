import { Test, TestingModule } from '@nestjs/testing';
import { FbadsService } from './fbads.service';

describe('FbadsService', () => {
  let service: FbadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FbadsService],
    }).compile();

    service = module.get<FbadsService>(FbadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
