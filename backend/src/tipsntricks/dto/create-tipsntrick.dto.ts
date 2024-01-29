export class CreateTipsntrickDto {
  tipsNtricks: {
    title: string;
    description: string;
  }[];
  user?: string;
}
