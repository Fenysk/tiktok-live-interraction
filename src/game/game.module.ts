import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { GameController } from './game.controller';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { GameStateService } from './services/game-state.service';
import { GameTimerService } from './services/game-timer.service';
import { LikeModule } from 'src/like/like.module';
import { QuestionsModule } from 'src/questions/questions.module';

@Module({
  imports: [
    WebsocketsModule,
    LikeModule,
    QuestionsModule,
  ],
  providers: [
    GameService,
    GameStateService,
    GameTimerService,
    TiktokService
  ],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}