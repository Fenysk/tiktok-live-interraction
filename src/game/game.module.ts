import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { QuizModule } from 'src/quiz/quiz.module';
import { GameController } from './game.controller';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { GameStateService } from './services/game-state.service';
import { GameTimerService } from './services/game-timer.service';

@Module({
  imports: [
    QuizModule,
    WebsocketsModule,
  ],
  providers: [
    GameService,
    GameStateService,
    GameTimerService,
    TiktokService
  ],
  exports: [GameService],
  controllers: [GameController]
})
export class GameModule {}