import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as readline from 'readline';
import { ValidationPipe } from '@nestjs/common';
import { GameService } from './game/game.service';
import { TiktokService } from './tiktok/tiktok.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      const gameService = app.get(GameService);
      gameService.stopGame();
      console.log('Stopping game and exiting...');
      process.exit();
    }
    if (key.name === 'l') {
      const tiktokService = app.get(TiktokService);
      tiktokService.initTikTokLiveConnection();
      console.log('Connecting to TikTok live...');
    }
    if (key.name === 's') {
      const gameService = app.get(GameService);
      gameService.startGame();
      console.log('Starting new game...');
    }
    if (key.name === 'q') {
      const gameService = app.get(GameService);
      gameService.stopGame();
      console.log('Stopping game...');
    }
  });
}
bootstrap();
