import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(80, { namespace: '/notification' })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: Logger = new Logger(AppGateway.name);

  @WebSocketServer()
  server: Server;

  private users: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    this.logger.verbose(`Connection Created for userId=${userId}`);

    if (userId) {
      this.users.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [key, val] of this.users) {
      if (val == client.id) {
        this.users.delete(key);

        this.logger.verbose(`Connection Terminated for userId=${key}`);
        break;
      }
    }
  }

  sendDownloadSuccessNotification(
    userId: string,
    age: number,
    fileName: string,
  ) {
    this.logger.verbose(
      `Download Success Notification Method Reqested for userId=${userId}, age=${age}, file=${fileName}`,
    );

    const socketId = this.users.get(userId);
    if (socketId) {
      this.server
        .to(socketId)
        .emit('Download-Success-Event', { age, fileName });
    }
  }

  sendDownloadFailureNotification(userId: string, age: number) {
    this.logger.verbose(
      `Download Failure Notification Method Reqested for userId=${userId}, age=${age}`,
    );

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
    this.logger.verbose(
      `Validation Failure Notification Method Reqested for userId=${userId}, file=${fileName}`,
    );

    const socketId = this.users.get(userId);
    if (socketId) {
      this.server
        .to(socketId)
        .emit('Validation-Failure-Event', { fileName, errors });
    }
  }
}
