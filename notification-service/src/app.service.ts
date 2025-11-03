import { Injectable } from '@nestjs/common';
import { AppGateway } from './app.gateway';

@Injectable()
export class AppService {
  constructor(private readonly gateway: AppGateway) {}

  sendDownloadSuccessNotification(
    userId: string,
    age: number,
    fileName: string,
  ) {
    this.gateway.sendDownloadSuccessNotification(userId, age, fileName);
  }

  sendDownloadFailureNotification(userId: string, age: number) {
    this.gateway.sendDownloadFailureNotification(userId, age);
  }

  sendValidationFailureNotification(
    userId: string,
    fileName: string,
    errors: string[],
  ) {
    this.gateway.sendValidationFailureNotification(userId, fileName, errors);
  }
}
