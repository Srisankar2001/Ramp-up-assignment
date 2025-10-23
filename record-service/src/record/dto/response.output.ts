import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ResponseDTO {
  @Field()
  success: boolean;
  @Field()
  message: string;

  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}
