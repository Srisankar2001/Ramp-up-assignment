import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vechile } from './vechile.entity';
import { VechileProcessor } from './vechileProcessor.processor';

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
    BullModule.registerQueue({
      name: 'importToVechileDB',
    }),
  ],
  controllers: [AppController],
  providers: [AppService,VechileProcessor],
})
export class AppModule {}
