import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateRecordInput {
  @Field()
  vin: string;

  @Field()
  date: string;

  @Field()
  maintenance: string;
}
