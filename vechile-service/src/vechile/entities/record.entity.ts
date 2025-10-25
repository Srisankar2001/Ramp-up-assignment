import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields:"vin")')
export class Record {
  @Field((type) => ID)
  @Directive('@external')
  id: number;

  @Field()
  vin: string;

  @Field()
  date: string;

  @Field()
  maintenance: string;
}
