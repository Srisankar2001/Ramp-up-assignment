import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Vechile } from '../entities/vechile.entity';

@ObjectType()
export class PaginationResponse {
  @Field(() => Int)
  totalPage: number;
  @Field(() => Int)
  currentPage: number;
  @Field(() => Int)
  limit: number;
  @Field(() => [Vechile])
  vechileList: Vechile[];

  constructor(
    totalPage: number,
    currentPage: number,
    limit: number,
    vechileList: Vechile[],
  ) {
    this.totalPage = totalPage;
    this.currentPage = currentPage;
    this.limit = limit;
    this.vechileList = vechileList;
  }
}
