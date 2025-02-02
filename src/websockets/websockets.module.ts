import {  forwardRef, Module } from '@nestjs/common';
import { WebsocketsGateway } from './websockets.gateway';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [
    forwardRef(() => GameModule),
  ],
  providers: [WebsocketsGateway],
  exports: [WebsocketsGateway]
})
export class WebsocketsModule {}
