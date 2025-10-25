import { Module } from '@nestjs/common';
import { VechileService } from './vechile.service';
import { VechileResolver } from './vechile.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vechile } from './entities/vechile.entity';
import { VechileController } from './vechile.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Vechile]), HttpModule],
  providers: [VechileResolver, VechileService],
  controllers: [VechileController],
})
export class VechileModule {}
