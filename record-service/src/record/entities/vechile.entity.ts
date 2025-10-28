import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { Record } from './record.entity';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields:"vin")')
export class Vechile {
  @Field()
  @Directive('@external')
  vin: string;

  @Field(() => [Record],{nullable:true})
  records: Record[];
}
