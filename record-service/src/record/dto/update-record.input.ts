import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateRecordInput {
  @Field({ nullable: true })
  vin?: string;

  @Field({ nullable: true })
  date?: string;

  @Field({ nullable: true })
  maintenance?: string;
}
