import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationAPI {
  constructor(private readonly httpService: HttpService) {}

  async sendDownloadSuccessNotification(userId, age, fileName) {
    try {
      await firstValueFrom(
        this.httpService.post(
          'http://localhost:4004/notification/download-success',
          { userId, age, fileName },
        ),
      );
    } catch (error) {
      console.error('Failed to send notification', error);
    }
  }

  async sendDownloadFailureNotification(userId, age) {
    try {
      await firstValueFrom(
        this.httpService.post(
          'http://localhost:4004/notification/download-failure',
          { userId, age },
        ),
      );
    } catch (error) {
      console.error('Failed to send notification', error);
    }
  }
}
