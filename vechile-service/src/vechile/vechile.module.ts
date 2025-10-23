import { Module } from '@nestjs/common';
import { VechileService } from './vechile.service';
import { VechileResolver } from './vechile.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vechile } from './entities/vechile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vechile])],
  providers: [VechileResolver, VechileService],
})
export class VechileModule {}
