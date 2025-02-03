import { Body, Controller, Post } from '@nestjs/common';
import { GameService } from 'src/game/game.service';
import { AnswerDto } from './dto/answer.dto';

@Controller('answers')
export class AnswersController {
    constructor(private readonly gameService: GameService) {}
    
    @Post()
    async handleAnswer(
      @Body() body: AnswerDto
    ): Promise<boolean> {
      return this.gameService.handleAnswer(
        body.player,
        body.answer
      );
    }
}


