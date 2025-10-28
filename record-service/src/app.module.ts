import { Module } from '@nestjs/common';
import { RecordModule } from './record/record.module';
import { Record } from './record/entities/record.entity';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vechile } from './record/entities/vechile.entity';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        path: 'schema.gql',
        federation: 2,
      },
      buildSchemaOptions: {
        orphanedTypes: [Vechile],
      },
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
