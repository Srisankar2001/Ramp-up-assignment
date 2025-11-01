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

  sendDownloadSuccessNotification(
    userId: string,
    age: number,
    fileName: string,
  ) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server
        .to(socketId)
        .emit('Download-Success-Event', { age, fileName });
    }
  }

  sendDownloadFailureNotification(userId: string, age: number) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('Download-Failure-Event', { age });
    }
  }

  sendValidationFailureNotification(
    userId: string,
    fileName: string,
    errors: string[],
  ) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server
        .to(socketId)
        .emit('Validation-Failure-Event', { fileName, errors });
    }
  }

  sendImportFailureNotification(
    userId: string,
    errorLog: string[],
    fileName: string,
  ) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server
        .to(socketId)
        .emit('Import-Failure-Event', { errorLog, fileName });
    }
  }

  sendImportSuccessNotification(userId: string, fileName: string) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('Import-Success-Event', { fileName });
    }
  }
}
