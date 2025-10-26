import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Vechile } from './vechile.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import * as csv from 'fast-csv';
import * as fs from 'fs';
import * as path from 'path';

@Processor('Export-Queue')
export class VechileExportProcessor extends WorkerHost {
  private readonly exportDir = path.join(process.cwd(), 'exports');
  constructor(
    @InjectRepository(Vechile) private readonly repo: Repository<Vechile>,
  ) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    const { age, userId } = job.data;
    try {
      const data = await this.repo.find({
        where: { age_of_vechile: MoreThanOrEqual(age) },
        order: { id: 'ASC' },
      });

      const timestamp = new Date().getTime();
      const fileName = `${userId}_${timestamp}.csv`;
      const filePath = path.join(this.exportDir, fileName);

      const ws = fs.createWriteStream(filePath);
      const stream = csv.format({ headers: true });

      stream.pipe(ws);
      data.forEach((row) => stream.write(row));
      stream.end();

      return await new Promise((resolve) => {
        ws.on('finish', () => {
          resolve({ success: true, fileName: fileName });
        });
      });
    } catch (error) {
      console.log('Error on Creating CSV file');
    }
  }
}
