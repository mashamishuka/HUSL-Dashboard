export class CreateOnboardingDto {
  title: string;
  content: string;
  actions?: {
    text: string;
    theme: string;
    type: string;
    url?: string;
  }[];
  order?: number;
}
