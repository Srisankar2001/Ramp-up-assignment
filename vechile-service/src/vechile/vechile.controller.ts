import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseDTO } from './dto/response.output';
import { VechileService } from './vechile.service';
import type { Response } from 'express';

@Controller('vechile')
export class VechileController {
  constructor(private readonly vechileService: VechileService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseDTO> {
    if (!file) {
      return new ResponseDTO(false, 'File Not Found');
    }
    return this.vechileService.upload(userId, file);
  }
  @Post('export')
  async export(
    @Body('age') age: number,
    @Body('userId') userId: string,
  ): Promise<ResponseDTO> {
    return this.vechileService.export(age, userId);
  }

  @Post('download')
  async download(
    @Body('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.vechileService.download(fileName, res);
  }
}
