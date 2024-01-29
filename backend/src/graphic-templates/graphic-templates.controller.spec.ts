import { Test, TestingModule } from '@nestjs/testing';
import { GraphicTemplatesController } from './graphic-templates.controller';
import { GraphicTemplatesService } from './graphic-templates.service';

describe('GraphicTemplatesController', () => {
  let controller: GraphicTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GraphicTemplatesController],
      providers: [GraphicTemplatesService],
    }).compile();

    controller = module.get<GraphicTemplatesController>(GraphicTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
