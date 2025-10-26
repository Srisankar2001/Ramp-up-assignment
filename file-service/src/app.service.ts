import { Injectable } from '@nestjs/common';
import { ResponseDTO } from './dto/response.dto';
import * as csv from 'fast-csv';
import { Readable } from 'stream';
import { VechileDTO } from './dto/vechile.dto';
import { Response } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  private readonly exportDir = path.join(process.cwd(), 'exports');
  constructor(
    @InjectQueue('Import-Queue') private readonly importQueue: Queue,
    @InjectQueue('Export-Queue') private readonly exportQueue: Queue,
  ) {}

  async upload(file: Express.Multer.File): Promise<ResponseDTO> {
    let rows: VechileDTO[] = [];
    const stream = Readable.from(file.buffer);
    return new Promise((resolve, reject) => {
      stream
        .pipe(csv.parse({ headers: true, trim: true }))
        .on('error', (error) => {
          console.error(error);
          reject(new ResponseDTO(false, 'CSV Parsing Failed'));
        })
        .on('data', (row) => {
          rows.push(row as VechileDTO);
          if (rows.length === 10) {
            this.importQueue.add('import-batch', rows, {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 3000,
              },
            });
            rows = [];
          }
        })
        .on('end', () => {
          if (rows.length > 0) {
            this.importQueue.add('import-batch', rows, {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 3000,
              },
            });
          }
          resolve(new ResponseDTO(true, 'CSV Parsed Successfully'));
        });
    });
  }

  async export(age: number, userId: string): Promise<ResponseDTO> {
    try {
      this.exportQueue.add(
        'export-batch',
        { age, userId },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
        },
      );
      return new ResponseDTO(true, 'Download Requested');
    } catch (error) {
      return new ResponseDTO(false, 'Download Failed');
    }
  }

  async download(fileNameArg: string, res: Response): Promise<ResponseDTO> {
    try {
      const fileName = fileNameArg;
      const filePath = path.join(this.exportDir, fileName);

      const exists = await this.checkFile(filePath);

      if (!exists) {
        return new ResponseDTO(false, 'File not found');
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="vechile.csv"',
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      return new ResponseDTO(true, 'Download Success');
    } catch (error) {
      return new ResponseDTO(false, 'Download Failed');
    }
  }

  private async checkFile(filePath: string): Promise<boolean> {
    const start = Date.now();
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (fs.existsSync(filePath)) {
          clearInterval(interval);
          resolve(true);
        } else if (Date.now() - start > 5000) {
          clearInterval(interval);
          resolve(false);
        }
      }, 500);
    });
  }
}
