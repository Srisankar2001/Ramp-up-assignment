import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vechile } from './vechile.entity';
import { VechileImportProcessor } from './import.processor';
import { VechileExportProcessor } from './export.processor';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '20011112',
      database: 'vechile',
      entities: [Vechile],
    }),
    TypeOrmModule.forFeature([Vechile]),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'Import-Queue',
      },
      { name: 'Export-Queue' },
    ),
  ],
  controllers: [AppController],
  providers: [AppService, VechileImportProcessor, VechileExportProcessor],
})
export class AppModule {}
