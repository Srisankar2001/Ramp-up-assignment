import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { MoreThanOrEqual, Repository } from 'typeorm';
import * as csv from 'fast-csv';
import * as fs from 'fs';
import * as path from 'path';
import { Vechile } from '../entities/vechile.entity';
import { NotificationAPI } from '../apis/notification.api';
import { Logger } from '@nestjs/common';

@Processor('Export-Queue')
export class VechileExportProcessor extends WorkerHost {
  private readonly logger: Logger = new Logger(VechileExportProcessor.name);
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
      this.logger.verbose(
        `Reqested for jobId=${job.id}, userId=${userId}, age=${age}`,
      );

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
          .on('finish', () => {
            this.logger.debug(
              `File successfully created for jobId=${job.id}, userId=${userId}, age=${age}, file=${fileName}`,
            );

            resolve();
          })
          .on('error', (err) => reject(err));

        data.forEach((row) => stream.write(row));
        stream.end();
      });

      this.logger.verbose(
        `Success for jobId=${job.id}, userId=${userId}, age=${age}`,
      );

      this.notificationAPI.sendDownloadSuccessNotification(
        userId,
        age,
        fileName,
      );
    } catch (error) {
      this.logger.error(
        `Failed for jobId=${job.id}, userId=${userId}, age=${age}, error=${error instanceof Error ? error.stack : JSON.stringify(error)}`,
      );

      this.notificationAPI.sendDownloadFailureNotification(userId, age);
    }
  }
}
