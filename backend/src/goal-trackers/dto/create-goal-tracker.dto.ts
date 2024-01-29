export class CreateGoalTrackerDto {
  sales?: number;
  calls?: number;
  user: string;
  type: 'earn' | 'bet';
}
