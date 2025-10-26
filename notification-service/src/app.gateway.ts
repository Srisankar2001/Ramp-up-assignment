import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(80, { namespace: '/notification' })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log(client.handshake.query);
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.users.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [key, val] of this.users) {
      if (val == client.id) {
        this.users.delete(key);
        break;
      }
    }
  }

  sendNotification(userId: string, age: number, fileName: string) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('Notification-Event', { age, fileName });
    }
  }
}
