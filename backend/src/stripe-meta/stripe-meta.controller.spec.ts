import { Test, TestingModule } from '@nestjs/testing';
import { StripeMetaController } from './stripe-meta.controller';
import { StripeMetaService } from './stripe-meta.service';

describe('StripeMetaController', () => {
  let controller: StripeMetaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeMetaController],
      providers: [StripeMetaService],
    }).compile();

    controller = module.get<StripeMetaController>(StripeMetaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
