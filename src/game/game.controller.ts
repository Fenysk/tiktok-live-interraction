import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { GameService } from './game.service';
import { StartGameRequest } from './dto/start-game.request';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @HttpCode(HttpStatus.OK)
  @Post('start')
  async startGame(
    @Body() startGameDto: StartGameRequest
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

  @Get('is-started')
  isGameStarted(): boolean {
    return this.gameService.isGameStarted();
  }

}
