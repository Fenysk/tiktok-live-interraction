import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { KeypressService } from './keypress/keypress.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);

  const keyPressService = app.get(KeypressService);
  keyPressService.listen(app);
}
bootstrap();
