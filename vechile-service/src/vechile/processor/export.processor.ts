import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { MoreThanOrEqual, Repository } from 'typeorm';
import * as csv from 'fast-csv';
import * as fs from 'fs';
import * as path from 'path';
import { Vechile } from '../entities/vechile.entity';
import { NotificationAPI } from '../apis/notification.api';

@Processor('Export-Queue')
export class VechileExportProcessor extends WorkerHost {
  private readonly exportDir = path.join(process.cwd(), 'exports');
  constructor(
    @InjectRepository(Vechile) private readonly repo: Repository<Vechile>,
    private readonly notificationAPI: NotificationAPI,
  ) {
    super();
  }
  async process(job: Job<any, any, string>) {
    const { age, userId } = job.data;
    try {
      const data = await this.repo.find({
        where: { age_of_vechile: MoreThanOrEqual(age) },
        order: { id: 'ASC' },
      });

      const timestamp = new Date().getTime();
      const fileName = `${userId}_${timestamp}.csv`;
      const filePath = path.join(this.exportDir, fileName);

      await new Promise<void>((resolve, reject) => {
        const ws = fs.createWriteStream(filePath);
        const stream = csv.format({ headers: true });

        stream
          .pipe(ws)
          .on('finish', () => resolve())
          .on('error', (err) => reject(err));

        data.forEach((row) => stream.write(row));
        stream.end();
      });

      this.notificationAPI.sendDownloadSuccessNotification(
        userId,
        age,
        fileName,
      );
    } catch (error) {
      this.notificationAPI.sendDownloadFailureNotification(userId, age);
    }
  }
}
