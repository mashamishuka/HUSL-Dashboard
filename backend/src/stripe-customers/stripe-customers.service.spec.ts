import { Test, TestingModule } from '@nestjs/testing';
import { StripeCustomersService } from './stripe-customers.service';

describe('StripeCustomersService', () => {
  let service: StripeCustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeCustomersService],
    }).compile();

    service = module.get<StripeCustomersService>(StripeCustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
