import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectDataSource } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { Vechile } from '../entities/vechile.entity';
import { Logger } from '@nestjs/common';

@Processor('Import-Queue')
export class VechileImportProcessor extends WorkerHost {
  private readonly logger: Logger = new Logger(VechileImportProcessor.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, fileName, vechileList } = job.data;

    this.logger.verbose(
      `Reqested for id=${job.id}, userId=${userId}, file=${fileName}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (let i = 0; i < vechileList.length; i++) {
        const age: number =
          new Date().getFullYear() -
          new Date(vechileList[i].manufactured_date.trim()).getFullYear();

        const vechile: Vechile = new Vechile(
          vechileList[i].first_name.trim(),
          vechileList[i].last_name.trim(),
          vechileList[i].email.trim().toUpperCase(),
          vechileList[i].car_make.trim(),
          vechileList[i].car_model.trim(),
          vechileList[i].vin.trim().toUpperCase(),
          vechileList[i].manufactured_date.trim(),
          age,
        );

        await queryRunner.manager.save(vechile);
      }
      await queryRunner.commitTransaction();

      this.logger.verbose(
        `Success for id=${job.id}, userId=${userId}, file=${fileName}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `Failed for id=${job.id}, userId=${userId}, file=${fileName}, error=${error instanceof Error ? error.stack : JSON.stringify(error)}}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
