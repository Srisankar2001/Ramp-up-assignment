import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseDTO } from './dto/response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

@Controller('file')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseDTO> {
    if (!file) {
      return new ResponseDTO(false, 'File Not Found');
    }
    return this.appService.upload(file);
  }

  @Post('export')
  async export(
    @Body('age') age: number,
    @Body('userId') userId: string,
    @Body('timestamp') timestamp: string,
  ): Promise<ResponseDTO> {
    return this.appService.export(age, userId, timestamp);
  }

  @Post('download')
  async download(@Body('fileName') fileName: string, @Res() res: Response) {
    return this.appService.download(fileName, res);
  }
}
