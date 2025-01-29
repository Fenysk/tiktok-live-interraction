import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GameService } from './game.service';
import { StartGameDto } from './dto/start-game.dto';

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

  @HttpCode(HttpStatus.OK)
  @Post('start')
  async startGame(
    @Body() startGameDto: StartGameDto
  ): Promise<void> {
    return this.gameService.startGame(startGameDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('stop') 
  async stopGame(): Promise<void> {
    return this.gameService.stopGame();
  }

  @HttpCode(HttpStatus.OK)
  @Post('next-question')
  async nextQuestion(): Promise<void> {
    return this.gameService.nextQuestion();
  }
}
