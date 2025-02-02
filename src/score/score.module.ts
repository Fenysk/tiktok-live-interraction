import { Module } from '@nestjs/common';
import { ScoreService } from './score.service';

@Module({
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}
