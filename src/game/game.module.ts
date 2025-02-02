import { forwardRef, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { GameController } from './game.controller';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { GameStateService } from './services/game-state.service';
import { GameTimerService } from './services/game-timer.service';
import { LikeModule } from 'src/like/like.module';
import { QuestionsModule } from 'src/questions/questions.module';
import { GameEventService } from './services/game-event.service';

@Module({
  imports: [
    forwardRef(() => WebsocketsModule),
    LikeModule,
    QuestionsModule,
  ],
  providers: [
    GameService,
    GameStateService,
    GameTimerService,
    GameEventService,
    TiktokService
  ],
  controllers: [GameController],
  exports: [
    GameService,
    GameStateService,
  ],
})
export class GameModule {}