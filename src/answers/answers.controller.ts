import { Body, Controller, Post } from '@nestjs/common';
import { ChatMessage } from 'src/tiktok/interface/chat.interface';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { TikTokEvent } from 'src/tiktok/enums/tiktok-event.enum';

@Controller('answers')
export class AnswersController {
    constructor(
      private readonly tiktokService: TiktokService,
    ) {}
    
    @Post()
    async handleAnswer(
      @Body() body: ChatMessage
    ): Promise<any> {
      return this.tiktokService.simulateEvent(
        TikTokEvent.NEW_MESSAGE,
        body
      );
    }
}


