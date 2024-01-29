import { Test, TestingModule } from '@nestjs/testing';
import { NicheScriptsService } from './niche-scripts.service';

describe('NicheScriptsService', () => {
  let service: NicheScriptsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NicheScriptsService],
    }).compile();

    service = module.get<NicheScriptsService>(NicheScriptsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
