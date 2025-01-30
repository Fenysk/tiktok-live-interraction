import { INestApplication, Injectable } from '@nestjs/common';
import * as readline from 'readline';
import { GameService } from 'src/game/game.service';
import { TiktokService } from 'src/tiktok/tiktok.service';

@Injectable()
export class KeypressService {
  constructor(
    private readonly gameService: GameService,
    private readonly tiktokService: TiktokService,
  ) {}

  listen(app: INestApplication<any>) {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
      switch (key.name) {
        case 'c':
          if (key.ctrl) {
            this.gameService.stopGame();
            console.log('Stopping game and exiting...');
            process.exit();
          }
          break;
        case 'l':
          this.tiktokService.initTikTokLiveConnection();      
          break;
        case 's':
          this.gameService.startGame({
            numberOfQuestions: 10
          });
          console.log('Starting new game...');
          break;
        case 'q':
          this.gameService.stopGame();
          console.log('Stopping game...');
          break;
        default:
          break;
      }
    });
  }
}