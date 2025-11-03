import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { Vechile } from '../entities/vechile.entity';
import { NotificationAPI } from '../apis/notification.api';

@Processor('Validate-Queue')
export class VechileValidateProcessor extends WorkerHost {
  private BATCH_SIZE: number = 100;
  constructor(
    @InjectRepository(Vechile) private readonly repo: Repository<Vechile>,
    @InjectQueue('Import-Queue') private readonly importQueue: Queue,
    private readonly notificationAPI: NotificationAPI,
  ) {
    super();
  }
  async process(job: Job<any, any, string>) {
    let errorLog: string[] = [];
    let flag: boolean = false;
    const { userId, vechileList, fileName } = job.data;
    for (let i = 0; i < vechileList.length; i++) {
      try {
        if (
          !vechileList[i].first_name ||
          vechileList[i].first_name.trim() == ''
        ) {
          flag = true;
          errorLog.push(
            '[ Row : ' +
              Number(i + 1) +
              ' ] ' +
              'First Name Error : ' +
              JSON.stringify(vechileList[i]),
          );
        }
        if (
          !vechileList[i].last_name ||
          vechileList[i].last_name.trim() == ''
        ) {
          flag = true;
          errorLog.push(
            '[ Row : ' +
              Number(i + 1) +
              ' ] ' +
              'Last Name Error : ' +
              JSON.stringify(vechileList[i]),
          );
        }
        if (!vechileList[i].email || vechileList[i].email.trim() == '') {
          flag = true;
          errorLog.push(
            '[ Row : ' +
              Number(i + 1) +
              ' ] ' +
              'Email Error : ' +
              JSON.stringify(vechileList[i]),
          );
        }
        if (!vechileList[i].car_make || vechileList[i].car_make.trim() == '') {
          flag = true;
          errorLog.push(
            '[ Row : ' +
              Number(i + 1) +
              ' ] ' +
              'Car Make Error : ' +
              JSON.stringify(vechileList[i]),
          );
        }
        if (
          !vechileList[i].car_model ||
          vechileList[i].car_model.trim() == ''
        ) {
          flag = true;
          errorLog.push(
            '[ Row : ' +
              Number(i + 1) +
              ' ] ' +
              'Car Model Error : ' +
              JSON.stringify(vechileList[i]),
          );
        }
        if (!vechileList[i].vin || vechileList[i].vin.trim() == '') {
          flag = true;
          errorLog.push(
            '[ Row : ' +
              Number(i + 1) +
              ' ] ' +
              'VIN Error : ' +
              JSON.stringify(vechileList[i]),
          );
        } else {
          const isVinExist = await this.repo.exists({
            where: { vin: vechileList[i].vin.trim().toUpperCase() },
          });
          if (isVinExist) {
            flag = true;
            errorLog.push(
              '[ Row : ' +
                Number(i + 1) +
                ' ] ' +
                'VIN Duplicate Error : ' +
                JSON.stringify(vechileList[i]),
            );
          }
          if (
            vechileList.find(
              (item, index) => item.vin === vechileList[i].vin && index !== i,
            )
          ) {
            flag = true;
            errorLog.push(
              '[ Row : ' +
                Number(i + 1) +
                ' ] ' +
                'VIN Duplicate in List Error : ' +
                JSON.stringify(vechileList[i]),
            );
          }
        }
        if (
          !vechileList[i].manufactured_date ||
          vechileList[i].manufactured_date.trim() == '' ||
          isNaN(Date.parse(vechileList[i].manufactured_date.trim())) ||
          new Date() < new Date(vechileList[i].manufactured_date)
        ) {
          flag = true;
          errorLog.push(
            '[ Row : ' +
              Number(i + 1) +
              ' ] ' +
              'Manufatured Date Error : ' +
              JSON.stringify(vechileList[i]),
          );
        }
      } catch (error) {
        flag = true;
        errorLog.push(
          '[ Row : ' +
            Number(i + 1) +
            ' ] ' +
            'Internal Error : ' +
            JSON.stringify(vechileList[i]),
        );
      }
    }

    if (!flag) {
      for (let i = 0; i < vechileList.length; i += this.BATCH_SIZE) {
        this.importQueue.add(
          'import-batch',
          vechileList.slice(i, i + this.BATCH_SIZE),
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 3000,
            },
          },
        );
      }
    } else {
      this.notificationAPI.sendValidationFailureNotification(
        userId,
        fileName,
        errorLog,
      );
    }
  }
}
