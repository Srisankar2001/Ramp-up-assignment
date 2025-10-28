import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectDataSource } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { Vechile } from '../entities/vechile.entity';

@Processor('Import-Queue')
export class VechileImportProcessor extends WorkerHost {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    const vechileList = job.data;
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
