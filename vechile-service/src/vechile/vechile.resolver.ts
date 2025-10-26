import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { VechileService } from './vechile.service';
import { Vechile } from './entities/vechile.entity';
import { CreateVechileInput } from './dto/create-vechile.input';
import { UpdateVechileInput } from './dto/update-vechile.input';
import { ResponseDTO } from './dto/response.output';

@Resolver(() => Vechile)
export class VechileResolver {
  constructor(private readonly vechileService: VechileService) {}

  @Mutation(() => ResponseDTO, { name: 'createVechile' })
  async createVechile(
    @Args('createVechileInput') createVechileInput: CreateVechileInput,
  ) {
    return this.vechileService.create(createVechileInput);
  }

  @Query(() => [Vechile], { name: 'getAllVechile' })
  async findAll(
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
  ) {
    return this.vechileService.findAll(page, limit);
  }

  @Query(() => [Vechile], { name: 'getAllVechileByModel' })
  async findAllByModel(@Args('model') model: string) {
    return this.vechileService.findAllByModel(model);
  }

  @Query(() => Vechile, { name: 'getVechile', nullable: true })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.vechileService.findOne(id);
  }

  @Query(() => Vechile, { name: 'getVechileByVIN', nullable: true })
  async findOneByVIN(@Args('vin') vin: string) {
    return this.vechileService.findOneByVIN(vin);
  }

  @Mutation(() => ResponseDTO, { name: 'updateVechile' })
  async updateVechile(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateVechileInput') updateVechileInput: UpdateVechileInput,
  ) {
    return this.vechileService.update(id, updateVechileInput);
  }

  @Mutation(() => ResponseDTO, { name: 'deleteVechile' })
  async removeVechile(@Args('id', { type: () => Int }) id: number) {
    return this.vechileService.remove(id);
  }

  @ResolveField()
  records(@Parent() vechile: Vechile) {
    return { __typename: 'Record', vin: vechile.vin };
  }
}
