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

  @Post('import-success')
  sendImportSuccessNotification(
    @Body('userId') userId: string,
    @Body('fileName') fileName: string,
  ): void {
    this.appService.sendImportSuccessNotification(userId, fileName);
  }

  @Post('import-failure')
  sendImportFailureNotification(
    @Body('userId') userId: string,
    @Body('errorLog') errorLog: string[],
    @Body('fileName') fileName: string,
  ): void {
    this.appService.sendImportFailureNotification(userId, errorLog, fileName);
  }
}
