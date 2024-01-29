import { Module } from '@nestjs/common';

import { WebsocketController } from './websocket.controller';
import { WebsocketService } from './websocket.service';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [WebsocketController],
  providers: [WebsocketService, NotificationsGateway],
  exports: [WebsocketService],
})
export class WebsocketModule {}
