import { Test, TestingModule } from '@nestjs/testing';
import { StripeMetaService } from './stripe-meta.service';

describe('StripeMetaService', () => {
  let service: StripeMetaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeMetaService],
    }).compile();

    service = module.get<StripeMetaService>(StripeMetaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
