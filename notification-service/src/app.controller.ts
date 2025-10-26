import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/notification')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  sendNotification(
    @Body('userId') userId: string,
    @Body('age') age: number,
    @Body('fileName') fileName: string,
  ): void {
    this.appService.sendNotification(userId,age,fileName);
  }
}
