export class CreatePurchaseDto {
  title: string;
  price: number;
  payment_intent: object;
  is_stripe_not_usdh: boolean;
  user: string;
  state: string;
  created: number;
  data?: { quantity?: number; stripe_price: string; repetition: string };
}
