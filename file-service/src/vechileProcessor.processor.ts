import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Vechile } from './vechile.entity';
import { Repository } from 'typeorm';

@Processor('importToVechileDB')
export class VechileProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Vechile) private readonly repo: Repository<Vechile>,
  ) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    const vechileList = job.data;
    let progress = 0;
    for (let i = 0; i < vechileList.length; i++) {
      try {
        if (
          !vechileList[i].first_name ||
          vechileList[i].first_name.trim() == ''
        ) {
          console.log('First Name Error : ' + JSON.stringify(vechileList[i]));
          continue;
        }
        if (
          !vechileList[i].last_name ||
          vechileList[i].last_name.trim() == ''
        ) {
          console.log('Last Name Error : ' + JSON.stringify(vechileList[i]));
          continue;
        }
        if (!vechileList[i].email || vechileList[i].email.trim() == '') {
          console.log('Email Error : ' + JSON.stringify(vechileList[i]));
          continue;
        }
        if (
          !vechileList[i].car_make ||
          vechileList[i].car_make.trim() == '' ||
          isNaN(Number(vechileList[i].car_make.trim())) ||
          Number(vechileList[i].car_make) > new Date().getFullYear() ||
          Number(vechileList[i].car_make) < 1900
        ) {
          console.log('Car Make Error : ' + JSON.stringify(vechileList[i]));
          continue;
        }
        if (
          !vechileList[i].car_model ||
          vechileList[i].car_model.trim() == ''
        ) {
          console.log('Car Model Error : ' + JSON.stringify(vechileList[i]));
          continue;
        }
        if (!vechileList[i].vin || vechileList[i].vin.trim() == '') {
          console.log('VIN Error : ' + JSON.stringify(vechileList[i]));
          continue;
        } else {
          const isVinExist = await this.repo.exists({
            where: { vin: vechileList[i].vin.trim().toUpperCase() },
          });
          if (isVinExist) {
            console.log(
              'VIN Duplicate Error : ' + JSON.stringify(vechileList[i]),
            );
            continue;
          }
        }
        if (
          !vechileList[i].manufactured_date ||
          vechileList[i].manufactured_date.trim() == '' ||
          isNaN(Date.parse(vechileList[i].manufactured_date.trim())) ||
          new Date() < new Date(vechileList[i].manufactured_date)
        ) {
          console.log(
            'Manufatured Date Error : ' + JSON.stringify(vechileList[i]),
          );
          continue;
        }

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
        await this.repo.save(vechile);
        ++progress;
      } catch (error) {
        console.log('Internal Error : ' + JSON.stringify(vechileList[i]));
        continue;
      }
    }
  }
}
