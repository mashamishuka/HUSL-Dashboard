export class CreateCourseParticipantDto {
  course_id: string;
  topic_id: string;
  completion_data?: {
    completion_time: number;
    topic_id: string;
    is_completed: boolean;
    reward?: any;
    reward_claimed?: boolean;
  };
}
