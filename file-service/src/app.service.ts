import { Injectable } from '@nestjs/common';
import { ResponseDTO } from './dto/response.dto';
import * as csv from 'fast-csv';
import { PassThrough, Readable } from 'stream';
import { VechileDTO } from './dto/vechile.dto';
import { Response } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AppService {
  constructor(
    @InjectQueue('importToVechileDB') private readonly vechileQueue: Queue,
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
            this.vechileQueue.add('import batch', rows, {
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
            this.vechileQueue.add('import batch', rows, {
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

  async download(data: VechileDTO[], res: Response): Promise<ResponseDTO> {
    try {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="vechile.csv"',
      );
      const stream = csv.format({ headers: true });
      const passthrough = new PassThrough();
      stream.pipe(passthrough).pipe(res);
      data.forEach((row) => stream.write(row));
      stream.end();
      return new ResponseDTO(true, 'Download Success');
    } catch (error) {
      return new ResponseDTO(false, 'Download Failed');
    }
  }
}
