import { PartialType } from '@nestjs/swagger';

import { CreateCourseParticipantDto } from './create-course-participant.dto';

export class TrackCourseParticipantDto extends PartialType(
  CreateCourseParticipantDto,
) {
  video_duration: number;
  video_played_time: number;
  attachment_downloaded: boolean;
  topic_id: string;
}
