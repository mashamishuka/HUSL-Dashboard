import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';

interface User {
  email: string;
  nftId: string;
  socketId?: string;
}
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  clients = new Map<string, Socket>();
  users: User[] = [];

  constructor(private readonly userService: UsersService) {}

  async afterInit() {
    // Retrieve user data from the database
    const users = await this.userService.findAll();
    console.log('Total users: ', users.length);
  }

  handleConnection(client: Socket) {
    const clientId = client.id;
    const _id = client.handshake.query._id as string;

    if (_id && !client.rooms.has(_id)) {
      client.join(_id);
      client.in(_id).emit('joinedRoom', _id);
      console.log(`Client ${client.id} joined room ${_id}`);
    }
    // Store the Socket connection with the client ID
    this.clients.set(clientId, client);
    console.log(`New user ${_id} connected.`);
  }

  handleDisconnect(client: Socket) {
    // Remove the Socket connection from the clients map
    this.clients.forEach((value, key) => {
      if (value.id === client.id) {
        this.clients.delete(key);
      }
    });
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): void {
    console.log(payload);

    const title = payload?.title;
    const message = payload?.content;
    const user_ids = payload?.name[0].value;
    const type = payload?.type;
    const status = payload?.status;
    const _id = payload?._id;
    // const isScheduled = payload?.isScheduled;

    this.server.in(user_ids).emit('message', {
      _id,
      title,
      content: message,
      timestamp: Date.now(),
      type,
      status,
    });
    // this.server.emit('message', payload);
  }
}
