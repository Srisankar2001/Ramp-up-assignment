import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { RecordService } from './record.service';
import { Record } from './entities/record.entity';
import { CreateRecordInput } from './dto/create-record.input';
import { UpdateRecordInput } from './dto/update-record.input';
import { ResponseDTO } from './dto/response.output';

@Resolver(() => Record)
export class RecordResolver {
  constructor(private readonly recordService: RecordService) {}

  @Mutation(() => ResponseDTO, { name: 'createRecord' })
  async createRecord(
    @Args('createRecordInput') createRecordInput: CreateRecordInput,
  ) {
    return this.recordService.create(createRecordInput);
  }

  @Query(() => [Record], { name: 'getAllRecord' })
  async findAll() {
    return this.recordService.findAll();
  }

  @Query(() => Record, { name: 'getRecord', nullable: true })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.recordService.findOne(id);
  }

  @Query(() => [Record], { name: 'getRecordByVIN' })
  async findByVIN(@Args('vin') vin: string) {
    return this.recordService.findByVIN(vin);
  }

  @Mutation(() => ResponseDTO)
  async updateRecord(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateRecordInput') updateRecordInput: UpdateRecordInput,
  ) {
    return this.recordService.update(id, updateRecordInput);
  }

  @Mutation(() => ResponseDTO)
  async removeRecord(@Args('id', { type: () => Int }) id: number) {
    return this.recordService.remove(id);
  }

  // @ResolveField()
  // vechile(@Parent() record: Record) {
  //   return { __typename: 'Vechile', vin: record.vin };
  // }
}
