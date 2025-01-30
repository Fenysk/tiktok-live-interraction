import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [GameModule],
  controllers: [AnswersController]
})
export class AnswersModule {}
