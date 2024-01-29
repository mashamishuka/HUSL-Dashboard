import { Test, TestingModule } from '@nestjs/testing';
import { StripeCustomersController } from './stripe-customers.controller';
import { StripeCustomersService } from './stripe-customers.service';

describe('StripeCustomersController', () => {
  let controller: StripeCustomersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeCustomersController],
      providers: [StripeCustomersService],
    }).compile();

    controller = module.get<StripeCustomersController>(
      StripeCustomersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
