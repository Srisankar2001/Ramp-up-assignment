import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateVechileInput {
  @Field({ nullable: false })
  first_name: string;

  @Field({ nullable: false })
  last_name: string;

  @Field({ nullable: false })
  email: string;

  @Field({ nullable: false })
  car_make: string;

  @Field({ nullable: false })
  car_model: string;

  @Field({ nullable: false })
  vin: string;

  @Field({ nullable: false })
  manufactured_date: string;
}
