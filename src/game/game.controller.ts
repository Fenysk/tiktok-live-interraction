import { Controller, Post, Body } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('answer')
  async handleAnswer(
    @Body() body: { userId: string; nickname: string; answer: string }
  ): Promise<boolean> {
    return this.gameService.handleAnswer(
      body.userId,
      body.nickname, 
      body.answer
    );
  }
}
