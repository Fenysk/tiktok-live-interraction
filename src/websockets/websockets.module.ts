import {  forwardRef, Module } from '@nestjs/common';
import { WebsocketsGateway } from './websockets.gateway';
import { GameModule } from 'src/game/game.module';
import { TiktokModule } from 'src/tiktok/tiktok.module';
import { WebsocketsController } from './websockets.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    forwardRef(() => GameModule),
    TiktokModule,
    UsersModule,
  ],
  providers: [WebsocketsGateway],
  exports: [WebsocketsGateway],
  controllers: [WebsocketsController]
})
export class WebsocketsModule {}
