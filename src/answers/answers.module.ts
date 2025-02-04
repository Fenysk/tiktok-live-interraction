import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { GameModule } from 'src/game/game.module';
import { TiktokModule } from 'src/tiktok/tiktok.module';

@Module({
  imports: [GameModule, TiktokModule],
  controllers: [AnswersController]
})
export class AnswersModule {}
