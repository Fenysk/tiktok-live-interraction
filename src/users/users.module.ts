import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TiktokModule } from 'src/tiktok/tiktok.module';
import { GameModule } from 'src/game/game.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';
import { YoutubeModule } from 'src/youtube/youtube.module';
import { TwitchModule } from 'src/twitch/twitch.module';

@Module({
  imports: [
    TiktokModule,
    forwardRef(() => GameModule),
    forwardRef(() => WebsocketsModule),
    YoutubeModule,
    TwitchModule,
  ],
  providers: [UsersService],
  exports: [UsersService],  
})
export class UsersModule {}
