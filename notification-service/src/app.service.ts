import { Injectable } from '@nestjs/common';
import { AppGateway } from './app.gateway';

@Injectable()
export class AppService {
  constructor(private readonly gateway: AppGateway) {}
  sendNotification(userId: string, age: number, fileName: string) {
    this.gateway.sendNotification(userId, age, fileName);
  }
}
