import { Module } from '@nestjs/common';
import { VechileService } from './vechile.service';
import { VechileResolver } from './vechile.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vechile } from './entities/vechile.entity';
import { VechileController } from './vechile.controller';
import { HttpModule } from '@nestjs/axios';
import { VechileImportProcessor } from './processor/import.processor';
import { VechileExportProcessor } from './processor/export.processor';
import { VechileValidateProcessor } from './processor/validate.processor';
import { NotificationAPI } from './apis/notification.api';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vechile]),
    HttpModule,
    BullModule.registerQueue(
      {
        name: 'Import-Queue',
      },
      {
        name: 'Export-Queue',
      },
      {
        name: 'Validate-Queue',
      },
    ),
  ],
  providers: [
    VechileResolver,
    VechileService,
    VechileImportProcessor,
    VechileExportProcessor,
    VechileValidateProcessor,
    NotificationAPI,
  ],
  controllers: [VechileController],
})
export class VechileModule {}
