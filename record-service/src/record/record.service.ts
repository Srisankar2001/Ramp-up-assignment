import { Injectable, Logger, Res } from '@nestjs/common';
import { CreateRecordInput } from './dto/create-record.input';
import { UpdateRecordInput } from './dto/update-record.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { Repository } from 'typeorm';
import { ResponseDTO } from './dto/response.output';

@Injectable()
export class RecordService {
  private readonly logger: Logger = new Logger(RecordService.name);

  constructor(
    @InjectRepository(Record)
    private readonly repo: Repository<Record>,
  ) {}

  async create(createRecordInput: CreateRecordInput): Promise<ResponseDTO> {
    try {
      this.logger.verbose(
        `Create Method Reqested for createRecordInput=${JSON.stringify(createRecordInput)}`,
      );

      if (!createRecordInput.vin || createRecordInput.vin.trim() === '') {
        return new ResponseDTO(false, 'VIN is Empty');
      }
      if (
        !createRecordInput.maintenance ||
        createRecordInput.maintenance.trim() === ''
      ) {
        return new ResponseDTO(false, 'Maintenance is Empty');
      }
      if (
        !createRecordInput.date ||
        createRecordInput.date.trim() === '' ||
        new Date() < new Date(createRecordInput.date.trim())
      ) {
        return new ResponseDTO(false, 'Date is Invalid or Empty');
      }

      const record = new Record(
        createRecordInput.date.trim(),
        createRecordInput.vin.trim().toUpperCase(),
        createRecordInput.maintenance.trim(),
      );

      await this.repo.save(record);

      this.logger.verbose(
        `Create Method Success for createRecordInput=${JSON.stringify(createRecordInput)}`,
      );

      return new ResponseDTO(true, 'Record Saved Successfully');
    } catch (error) {
      this.logger.error(
        `Create Method Failed for createRecordInput=${JSON.stringify(createRecordInput)}`,
      );

      return new ResponseDTO(false, 'Internal Server Error');
    }
  }

  async findAll(): Promise<Record[]> {
    this.logger.verbose(`Find All Method Reqested`);

    return await this.repo.find();
  }

  async findOne(id: number): Promise<Record | null> {
    this.logger.verbose(`Find One Method Reqested for id=${id}`);

    return await this.repo.findOne({ where: { id: id } });
  }

  async findByVIN(vin: string): Promise<Record[]> {
    this.logger.verbose(
      `Find By VIN Method Reqested for vin=${vin.trim().toUpperCase()}`,
    );

    let formattedVIN = vin.trim().toUpperCase();
    return await this.repo.find({ where: { vin: formattedVIN } });
  }

  async update(
    id: number,
    updateRecordInput: UpdateRecordInput,
  ): Promise<ResponseDTO> {
    try {
      this.logger.verbose(
        `Update Method Reqested for id=${id} updateRecordInput=${JSON.stringify(updateRecordInput)}`,
      );

      let record: Record | null = await this.repo.findOne({
        where: { id: id },
      });
      if (!record) {
        return new ResponseDTO(false, 'ID not Found');
      }

      if (
        updateRecordInput.vin &&
        updateRecordInput.vin.trim() !== '' &&
        updateRecordInput.vin.trim().toUpperCase() !== record.vin
      ) {
        record.vin = updateRecordInput.vin.trim().toUpperCase();
      }
      if (
        updateRecordInput.maintenance &&
        updateRecordInput.maintenance.trim() !== '' &&
        updateRecordInput.maintenance.trim() !== record.maintenance
      ) {
        record.maintenance = updateRecordInput.maintenance.trim();
      }
      if (
        updateRecordInput.date &&
        updateRecordInput.date.trim() !== '' &&
        updateRecordInput.date.trim() !== record.date
      ) {
        if (new Date() < new Date(updateRecordInput.date.trim())) {
          return new ResponseDTO(false, 'Date is Invalid');
        } else {
          record.date = updateRecordInput.date.trim();
        }
      }
      await this.repo.update({ id: id }, record);

      this.logger.verbose(
        `Update Method Success for id=${id}, updateRecordInput=${JSON.stringify(updateRecordInput)}`,
      );

      return new ResponseDTO(true, 'Record Updated Successfully');
    } catch (error) {
      this.logger.error(
        `Update Method Failed for id=${id}, updateRecordInput=${JSON.stringify(updateRecordInput)}, error=${error instanceof Error ? error.stack : JSON.stringify(error)}`,
      );

      return new ResponseDTO(false, 'Internal Server  Error');
    }
  }

  async remove(id: number): Promise<ResponseDTO> {
    try {
      this.logger.verbose(`Delete Method Requested for id=${id}`);

      let record = await this.repo.findOne({ where: { id: id } });
      if (!record) {
        return new ResponseDTO(false, 'ID not Found');
      }
      await this.repo.delete({ id: id });

      this.logger.verbose(`Delete Method Success for id=${id}`);

      return new ResponseDTO(true, 'Record Deleted Successfully');
    } catch (error) {
      this.logger.error(
        `Delete Method Failed for id=${id}, error=${error instanceof Error ? error.stack : JSON.stringify(error)}`,
      );

      return new ResponseDTO(false, 'Internal Server  Error');
    }
  }
}
