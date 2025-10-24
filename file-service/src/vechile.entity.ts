import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Vechile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  car_make: string;

  @Column()
  car_model: string;

  @Column({ unique: true })
  vin: string;

  @Column()
  manufactured_date: string;

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
