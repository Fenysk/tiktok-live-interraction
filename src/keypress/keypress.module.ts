import { Module } from '@nestjs/common';
import { GameModule } from '../game/game.module';
import { TiktokModule } from '../tiktok/tiktok.module';
import { KeypressService } from './keypress.service';

@Module({
  imports: [GameModule, TiktokModule],
  providers: [KeypressService]
})
export class KeypressModule {}
