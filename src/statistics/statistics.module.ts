import { Global, Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Global()
@Module({
  providers: [StatisticsService],
  exports: [StatisticsService]
})
export class StatisticsModule {}
