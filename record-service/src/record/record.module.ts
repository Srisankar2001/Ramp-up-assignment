import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordResolver } from './record.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { vechileResolver } from './vechile.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Record])],
  providers: [RecordResolver, RecordService,vechileResolver],
})
export class RecordModule {}
