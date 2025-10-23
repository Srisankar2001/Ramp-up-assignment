import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Vechile {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  first_name: string;

  @Field()
  @Column()
  last_name: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  car_make: string;

  @Field()
  @Column()
  car_model: string;

  @Field()
  @Column({ unique: true })
  vin: string;

  @Field()
  @Column()
  manufactured_date: string;

  @Field(() => Int)
  @Column()
  age_of_vechile: number;

  constructor(
    first_name: string,
    last_name: string,
    email: string,
    car_make: string,
    car_model: string,
    vin: string,
    manufactured_date: string,
    age_of_vechile: number,
  ) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.car_make = car_make;
    this.car_model = car_model;
    this.vin = vin;
    this.manufactured_date = manufactured_date;
    this.age_of_vechile = age_of_vechile;
  }
}
