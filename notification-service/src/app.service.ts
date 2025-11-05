import { Injectable, Logger } from '@nestjs/common';
import { AppGateway } from './app.gateway';

@Injectable()
export class AppService {
  private readonly logger: Logger = new Logger(AppService.name);

  constructor(private readonly gateway: AppGateway) {}

  sendDownloadSuccessNotification(
    userId: string,
    age: number,
    fileName: string,
  ) {
    this.logger.verbose(
      `Download Success Notification Method Reqested for userId=${userId}, age=${age}, file=${fileName}`,
    );

    this.gateway.sendDownloadSuccessNotification(userId, age, fileName);
  }

  sendDownloadFailureNotification(userId: string, age: number) {
    this.logger.verbose(
      `Download Failure Notification Method Reqested for userId=${userId}, age=${age}`,
    );

    this.gateway.sendDownloadFailureNotification(userId, age);
  }

  sendValidationFailureNotification(
    userId: string,
    fileName: string,
    errors: string[],
  ) {
    this.logger.verbose(
      `Validation Failure Notification Method Reqested for userId=${userId}, file=${fileName}`,
    );

    this.gateway.sendValidationFailureNotification(userId, fileName, errors);
  }
}
