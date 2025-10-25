import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseDTO } from './dto/response.output';
import { VechileService } from './vechile.service';

@Controller('vechile')
export class VechileController {
  constructor(private readonly vechileService: VechileService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseDTO> {
    if (!file) {
      return new ResponseDTO(false, 'File Not Found');
    }
    return this.vechileService.upload(file);
  }
}
