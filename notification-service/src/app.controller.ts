import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('notification')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('download-success')
  sendDownloadSuccessNotification(
    @Body('userId') userId: string,
    @Body('age') age: number,
    @Body('fileName') fileName: string,
  ): void {
    this.appService.sendDownloadSuccessNotification(userId, age, fileName);
  }

  @Post('download-failure')
  sendDownloadFailureNotification(
    @Body('userId') userId: string,
    @Body('age') age: number,
  ): void {
    this.appService.sendDownloadFailureNotification(userId, age);
  }

  @Post('validation-failure')
  sendValidationFailureNotification(
    @Body('userId') userId: string,
    @Body('fileName') fileName: string,
    @Body('errors') errors: string[],
  ): void {
    this.appService.sendValidationFailureNotification(userId, fileName, errors);
  }
}
