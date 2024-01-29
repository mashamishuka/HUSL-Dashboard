import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from 'src/users/users.service';

const USER_ID = '6499b807446bcda2a6c6bc8d'; // _id
@Injectable()
export class WebsocketService {
  constructor(private readonly websocket: NotificationsGateway) {}

  sendMessage(message: string): void {
    // Broadcast event
    this.websocket.server.emit('message', message);
    // Emit event to specific user
    this.websocket.server.to(USER_ID).emit('private-event', {
      id: 1,
      message: message,
      createdAt: new Date().getTime().toString(),
    });
  }
}
