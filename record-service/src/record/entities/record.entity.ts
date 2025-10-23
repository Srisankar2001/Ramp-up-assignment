import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
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
  constructor(date: string, vin: string, maintenance: string) {
    this.date = date;
    this.vin = vin;
    this.maintenance = maintenance;
  }
}
