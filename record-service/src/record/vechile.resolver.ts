import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Vechile } from './entities/vechile.entity';
import { RecordService } from './record.service';
import { Record } from './entities/record.entity';

@Resolver((of) => Vechile)
export class vechileResolver {
  constructor(private readonly recordService: RecordService) {}

  @ResolveField()
  records(@Parent() vechile: Vechile): Promise<Record[]> {
    return this.recordService.findByVIN(vechile.vin);
  }
}
