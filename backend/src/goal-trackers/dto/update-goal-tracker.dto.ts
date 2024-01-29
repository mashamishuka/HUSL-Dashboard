import { PartialType } from '@nestjs/swagger';
import { CreateGoalTrackerDto } from './create-goal-tracker.dto';

export class UpdateGoalTrackerDto extends PartialType(CreateGoalTrackerDto) {}
