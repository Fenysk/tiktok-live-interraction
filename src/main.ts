import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as readline from 'readline';
import { ValidationPipe } from '@nestjs/common';
import { GameService } from './game/game.service';
import { TiktokService } from './tiktok/tiktok.service';
import { KeypressService } from './keypress/keypress.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);

  const tiktokService = app.get(TiktokService);
  await tiktokService.initTikTokLiveConnection();

  const keyPressService = app.get(KeypressService);
  keyPressService.listen(app);
}
bootstrap();
