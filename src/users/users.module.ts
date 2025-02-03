import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TiktokModule } from 'src/tiktok/tiktok.module';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [
    TiktokModule,
    forwardRef(() => GameModule),
  ],
  providers: [UsersService],
  exports: [UsersService],  
})
export class UsersModule {}
