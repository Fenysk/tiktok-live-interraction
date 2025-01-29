import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { QuizModule } from 'src/quiz/quiz.module';
import { GameController } from './game.controller';
import { WebsocketsModule } from 'src/websockets/websockets.module';

@Module({
  imports: [
    QuizModule,
    WebsocketsModule,
  ],
  providers: [GameService, TiktokService],
  exports: [GameService],
  controllers: [GameController]
})
export class GameModule {}