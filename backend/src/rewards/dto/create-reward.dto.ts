export class CreateRewardDto {
  name?: string;
  amount: number;
  reference: string;
  description: string;
  claimableBy: string;
}
