import { Controller, Get } from '@nestjs/common';
import { TiktokService } from './tiktok.service';

@Controller('tiktok')
export class TiktokController {
  constructor(private readonly tiktokService: TiktokService) {}

  @Get('link-to-live')
  linkToLive() {
    return this.tiktokService.initTikTokLiveConnection();
  }
}
