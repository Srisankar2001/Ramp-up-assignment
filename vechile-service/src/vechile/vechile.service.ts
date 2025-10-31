import { Injectable } from '@nestjs/common';
import { CreateVechileInput } from './dto/create-vechile.input';
import { UpdateVechileInput } from './dto/update-vechile.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Vechile } from './entities/vechile.entity';
import { ILike, Repository } from 'typeorm';
import { ResponseDTO } from './dto/response.output';
import { InjectQueue } from '@nestjs/bullmq';
import { VechileDTO } from './dto/vechile.dto';
import { Readable } from 'stream';
import * as csv from 'fast-csv';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import { Response } from 'express';
import { Queue } from 'bullmq';
import { PaginationResponse } from './dto/paginationResponse.output';

@Injectable()
export class VechileService {
  private readonly exportDir = path.join(process.cwd(), 'exports');
  constructor(
    @InjectRepository(Vechile)
    private readonly repo: Repository<Vechile>,
    @InjectQueue('Export-Queue') private readonly exportQueue: Queue,
    @InjectQueue('Validate-Queue') private readonly validateQueue: Queue,
  ) {}

  async upload(
    userId: string,
    file: Express.Multer.File,
  ): Promise<ResponseDTO> {
    let rows: VechileDTO[] = [];
    const stream = Readable.from(file.buffer);
    return new Promise((resolve, reject) => {
      stream
        .pipe(csv.parse({ headers: true, trim: true }))
        .on('error', (error) => {
          reject(new ResponseDTO(false, 'CSV Parsing Failed'));
        })
        .on('data', (row) => {
          rows.push(row as VechileDTO);
        })
        .on('end', () => {
          this.validateQueue.add(
            'validate-batch',
            { userId, vechileList: rows },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 3000,
              },
            },
          );
          resolve(new ResponseDTO(true, 'CSV Parsed Successfully'));
        });
    });
  }

  async export(age: number, userId: string): Promise<ResponseDTO> {
    try {
      this.exportQueue.add(
        'export-batch',
        { age, userId },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
        },
      );
      return new ResponseDTO(true, 'Download Requested');
    } catch (error) {
      return new ResponseDTO(false, 'Download Failed');
    }
  }

  async download(fileNameArg: string, res: Response): Promise<Response> {
    try {
      const fileName = fileNameArg;
      const filePath = path.join(this.exportDir, fileName);

      const exists = await this.checkFile(filePath);

      if (!exists) {
        return res.status(404).send('File Not Found');
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="vechile.csv"',
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      return res;
    } catch (error) {
      return res.status(500).send('Download Failed');
    }
  }

  private async checkFile(filePath: string): Promise<boolean> {
    try {
      await fsPromises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // GraphQL Method
  async create(createVechileInput: CreateVechileInput): Promise<ResponseDTO> {
    try {
      if (
        !createVechileInput.first_name ||
        createVechileInput.first_name.trim() == ''
      ) {
        return new ResponseDTO(false, 'First Name is Empty');
      }
      if (
        !createVechileInput.last_name ||
        createVechileInput.last_name.trim() == ''
      ) {
        return new ResponseDTO(false, 'Last Name is Empty');
      }
      if (!createVechileInput.email || createVechileInput.email.trim() == '') {
        return new ResponseDTO(false, 'Email is Empty');
      }
      if (
        !createVechileInput.car_make ||
        createVechileInput.car_make.trim() == ''
      ) {
        return new ResponseDTO(false, 'Car Make is Empty or Invalid');
      }
      if (
        !createVechileInput.car_model ||
        createVechileInput.car_model.trim() == ''
      ) {
        return new ResponseDTO(false, 'Car Model is Empty');
      }
      if (!createVechileInput.vin || createVechileInput.vin.trim() == '') {
        return new ResponseDTO(false, 'VIN is Empty');
      } else {
        const isVinExist = await this.repo.exists({
          where: { vin: createVechileInput.vin.trim().toUpperCase() },
        });
        if (isVinExist) {
          return new ResponseDTO(false, 'VIN already exists');
        }
      }
      if (
        !createVechileInput.manufactured_date ||
        createVechileInput.manufactured_date.trim() == '' ||
        isNaN(Date.parse(createVechileInput.manufactured_date.trim())) ||
        new Date() < new Date(createVechileInput.manufactured_date)
      ) {
        return new ResponseDTO(false, 'Manufactured Date is Empty or Invalid');
      }

      const age: number =
        new Date().getFullYear() -
        new Date(createVechileInput.manufactured_date.trim()).getFullYear();
      const vechile: Vechile = new Vechile(
        createVechileInput.first_name.trim(),
        createVechileInput.last_name.trim(),
        createVechileInput.email.trim().toUpperCase(),
        createVechileInput.car_make.trim(),
        createVechileInput.car_model.trim(),
        createVechileInput.vin.trim().toUpperCase(),
        createVechileInput.manufactured_date.trim(),
        age,
      );

      await this.repo.save(vechile);
      return new ResponseDTO(true, 'Vechile Saved Successfully');
    } catch (error) {
      return new ResponseDTO(false, 'Internal Server Error');
    }
  }

  async findAll(
    pageArg: number,
    limitArg: number,
  ): Promise<PaginationResponse> {
    const total = await this.repo.count();

    let limit = limitArg > 0 ? limitArg : 100;
    let totalPage = Math.ceil(total / limit);
    if (totalPage === 0) totalPage = 1;
    let page = pageArg > 0 ? pageArg : 1;

    if (page > totalPage) {
      page = totalPage > 0 ? totalPage : 1;
    }

    let vechileList: Vechile[] = await this.repo.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { manufactured_date: 'ASC' },
    });

    return new PaginationResponse(totalPage, page, limit, vechileList);
  }

  async findOne(id: number): Promise<Vechile | null> {
    return await this.repo.findOne({ where: { id: id } });
  }

  async findAllByModel(
    model: string,
    pageArg: number,
    limitArg: number,
  ): Promise<PaginationResponse> {
    if (!model || model.trim() === '') {
      return this.findAll(pageArg, limitArg);
    }

    const total = await this.repo.count({
      where: { car_model: ILike(`${model.trim()}%`) },
    });

    let limit = limitArg > 0 ? limitArg : 100;
    let totalPage = Math.ceil(total / limit);
    if (totalPage === 0) totalPage = 1;
    let page = pageArg > 0 ? pageArg : 1;

    if (page > totalPage) {
      page = totalPage > 0 ? totalPage : 1;
    }

    let vechileList: Vechile[] = await this.repo.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { manufactured_date: 'ASC' },
      where: { car_model: ILike(`${model.trim()}%`) },
    });

    return new PaginationResponse(totalPage, page, limit, vechileList);
  }

  async findOneByVIN(vin: string): Promise<Vechile | null> {
    return await this.repo.findOne({
      where: { vin: vin.trim().toUpperCase() },
    });
  }

  async update(
    id: number,
    updateVechileInput: UpdateVechileInput,
  ): Promise<ResponseDTO> {
    try {
      let vechile = await this.repo.findOne({ where: { id: id } });
      if (!vechile) {
        return new ResponseDTO(false, 'ID not Found');
      }

      if (
        updateVechileInput.first_name &&
        updateVechileInput.first_name.trim() != '' &&
        updateVechileInput.first_name.trim() !== vechile.first_name
      ) {
        vechile.first_name = updateVechileInput.first_name.trim();
      }
      if (
        updateVechileInput.last_name &&
        updateVechileInput.last_name.trim() != '' &&
        updateVechileInput.last_name.trim() !== vechile.last_name
      ) {
        vechile.last_name = updateVechileInput.last_name;
      }
      if (
        updateVechileInput.email &&
        updateVechileInput.email.trim() != '' &&
        updateVechileInput.email.trim() !== vechile.email
      ) {
        vechile.email = updateVechileInput.email;
      }
      if (
        updateVechileInput.car_make &&
        updateVechileInput.car_make.trim() != '' &&
        updateVechileInput.car_make.trim() !== vechile.car_make
      ) {
        if (
          isNaN(Number(updateVechileInput.car_make.trim())) ||
          Number(updateVechileInput.car_make) > new Date().getFullYear() ||
          Number(updateVechileInput.car_make) < 1900
        ) {
          return new ResponseDTO(false, 'Car Make is Invalid');
        } else {
          vechile.car_make = updateVechileInput.car_make.trim();
        }
      }
      if (
        updateVechileInput.car_model &&
        updateVechileInput.car_model.trim() != '' &&
        updateVechileInput.car_model.trim() !== vechile.car_model
      ) {
        vechile.car_model = updateVechileInput.car_model.trim();
      }
      if (
        updateVechileInput.vin &&
        updateVechileInput.vin.trim() != '' &&
        updateVechileInput.vin.trim().toUpperCase() !== vechile.vin
      ) {
        const isVinExist = await this.repo.exists({
          where: { vin: updateVechileInput.vin.trim().toUpperCase() },
        });
        if (isVinExist) {
          return new ResponseDTO(false, 'VIN already exists');
        } else {
          vechile.vin = updateVechileInput.vin.trim().toUpperCase();
        }
      }
      if (
        updateVechileInput.manufactured_date &&
        updateVechileInput.manufactured_date.trim() != '' &&
        updateVechileInput.manufactured_date.trim() !==
          vechile.manufactured_date
      ) {
        if (
          isNaN(Date.parse(updateVechileInput.manufactured_date.trim())) ||
          new Date() < new Date(updateVechileInput.manufactured_date.trim())
        ) {
          return new ResponseDTO(false, 'Manufactured Date is Invalid');
        } else {
          const age: number =
            new Date().getFullYear() -
            new Date(updateVechileInput.manufactured_date.trim()).getFullYear();

          vechile.manufactured_date =
            updateVechileInput.manufactured_date.trim();
          vechile.age_of_vechile = age;
        }
      }

      await this.repo.update({ id: id }, vechile);
      return new ResponseDTO(true, 'Vechile  Updated Successfully');
    } catch (error) {
      return new ResponseDTO(false, 'Internal Server Error');
    }
  }

  async remove(id: number) {
    try {
      let vechile = await this.repo.findOne({ where: { id: id } });
      if (!vechile) {
        return new ResponseDTO(false, 'ID not Found');
      }
      await this.repo.delete({ id: id });
      return new ResponseDTO(true, 'Vechile Deleted Successfully');
    } catch (error) {
      return new ResponseDTO(false, 'Internal Server Error');
    }
  }
}
