import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Module({
  providers: [StatisticsService]
})
export class StatisticsModule {}
