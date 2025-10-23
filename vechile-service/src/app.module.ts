import { Module } from '@nestjs/common';
import { VechileModule } from './vechile/vechile.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vechile } from './vechile/entities/vechile.entity';

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
      database: 'vechile',
      entities: [Vechile],
      synchronize: true,
    }),
    VechileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
