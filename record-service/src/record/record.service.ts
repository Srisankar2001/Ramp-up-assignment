import { Injectable, Res } from '@nestjs/common';
import { CreateRecordInput } from './dto/create-record.input';
import { UpdateRecordInput } from './dto/update-record.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { Repository } from 'typeorm';
import { ResponseDTO } from './dto/response.output';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private readonly repo: Repository<Record>,
  ) {}

  async create(createRecordInput: CreateRecordInput): Promise<ResponseDTO> {
    try {
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
      return new ResponseDTO(true, 'Record Saved Successfully');
    } catch (error) {
      return new ResponseDTO(false, 'Internal Server Error');
    }
  }

  async findAll(): Promise<Record[]> {
    return await this.repo.find();
  }

  async findOne(id: number): Promise<Record | null> {
    return await this.repo.findOne({ where: { id: id } });
  }

  async findByVIN(vin: string): Promise<Record[]> {
    let formattedVIN = vin.trim().toUpperCase();
    return await this.repo.find({ where: { vin: formattedVIN } });
  }

  async update(
    id: number,
    updateRecordInput: UpdateRecordInput,
  ): Promise<ResponseDTO> {
    try {
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
      return new ResponseDTO(true, 'Record Updated Successfully');
    } catch (error) {
      return new ResponseDTO(false, 'Internal Server  Error');
    }
  }

  async remove(id: number): Promise<ResponseDTO> {
    try {
      let record = await this.repo.findOne({ where: { id: id } });
      if (!record) {
        return new ResponseDTO(false, 'ID not Found');
      }
      await this.repo.delete({ id: id });
      return new ResponseDTO(true, 'Record Deleted Successfully');
    } catch (error) {
      return new ResponseDTO(false, 'Internal Server  Error');
    }
  }
}
