import { Test, TestingModule } from '@nestjs/testing';
import { GraphicTemplatesService } from './graphic-templates.service';

describe('GraphicTemplatesService', () => {
  let service: GraphicTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphicTemplatesService],
    }).compile();

    service = module.get<GraphicTemplatesService>(GraphicTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
