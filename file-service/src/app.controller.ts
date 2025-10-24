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
import { VechileDTO } from './dto/vechile.dto';
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

  @Post('download')
  async download(@Body('data') data: VechileDTO[], @Res() res: Response) {
    return this.appService.download(data, res);
  }
}
