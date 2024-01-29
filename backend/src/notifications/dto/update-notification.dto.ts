import { PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';

export class UpdateNotifications extends PartialType(CreateNotificationDto) {}
