import { Controller, Get } from '@nestjs/common';
import { YoutubeService } from './youtube.service';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('link-to-live')
  linkToLive() {
    return this.youtubeService.initYoutubeLiveConnection();
  }
}
