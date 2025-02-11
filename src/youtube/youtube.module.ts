import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { YoutubeController } from './youtube.controller';

@Module({
  providers: [YoutubeService],
  exports: [YoutubeService],
  controllers: [YoutubeController],
})
export class YoutubeModule {}
