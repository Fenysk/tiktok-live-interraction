import { Module } from '@nestjs/common';
import { JsonService } from './utils/json.service';

@Module({
  providers: [JsonService],
  exports: [JsonService],
})
export class CommonModule {}
