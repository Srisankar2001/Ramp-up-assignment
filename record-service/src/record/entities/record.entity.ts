import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Vechile } from './vechile.entity';

@ObjectType()
@Directive('@key(fields:"id")')
@Entity()
export class Record {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  vin: string;

  @Field()
  @Column()
  date: string;

  @Field()
  @Column()
  maintenance: string;

  @Field()
  vechile: Vechile;

  constructor(date: string, vin: string, maintenance: string) {
    this.date = date;
    this.vin = vin;
    this.maintenance = maintenance;
  }
}
