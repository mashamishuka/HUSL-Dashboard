import { Controller, Get } from '@nestjs/common';
import { WebsocketService } from './websocket.service';

@Controller('websocket')
export class WebsocketController {
  constructor(private readonly websocketService: WebsocketService) {}

  @Get('/')
  async create(): Promise<string> {
    this.websocketService.sendMessage('Ping');
    return 'Sent successfully';
  }
}
