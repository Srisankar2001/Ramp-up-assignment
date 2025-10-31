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

  sendValidationFailureNotification(userId: string) {
    this.gateway.sendValidationFailureNotification(userId);
  }

  sendImportFailureNotification(
    userId: string,
    errorLog: string[],
    fileName: string,
  ) {
    this.sendImportFailureNotification(userId, errorLog, fileName);
  }

  sendImportSuccessNotification(userId: string, fileName: string) {
    this.gateway.sendImportSuccessNotification(userId, fileName);
  }
}
