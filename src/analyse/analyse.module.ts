import { Module } from '@nestjs/common';
import { AnalyseService } from './analyse.service';
import { AnalyseController } from './analyse.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  providers: [AnalyseService],
  controllers: [AnalyseController]
})
export class AnalyseModule {}
