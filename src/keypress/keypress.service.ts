import { Injectable } from '@nestjs/common';
import * as readline from 'readline';
import { GameService } from 'src/game/game.service';
import { TiktokService } from 'src/tiktok/tiktok.service';

@Injectable()
export class KeypressService {
  listen(app: any) {
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
      }
      if (key.name === 's') {
        const gameService = app.get(GameService);
        gameService.startGame({
          numberOfQuestions: 10
        });
        console.log('Starting new game...');
      }
      if (key.name === 'q') {
        const gameService = app.get(GameService);
        gameService.stopGame();
        console.log('Stopping game...');
      }
    });
  }
}