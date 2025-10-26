import { Module } from '@nestjs/common';
import { VechileModule } from './vechile/vechile.module';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vechile } from './vechile/entities/vechile.entity';
import { HttpModule } from '@nestjs/axios';
import { Record } from './vechile/entities/record.entity';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      autoSchemaFile: {
        path: 'schema.gql',
        federation: 2,
      },
      buildSchemaOptions: {
        orphanedTypes: [Record],
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '20011112',
      database: 'vechile',
      entities: [Vechile],
      synchronize: true,
    }),
    HttpModule.register({
      timeout: 5000,
    }),
    VechileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
