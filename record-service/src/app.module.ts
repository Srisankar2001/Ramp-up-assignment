import { Module } from '@nestjs/common';
import { RecordModule } from './record/record.module';
import { Record } from './record/entities/record.entity';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '20011112',
      database: 'record',
      entities: [Record],
      synchronize: true,
    }),
    RecordModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
