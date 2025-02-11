import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { KeypressService } from './keypress/keypress.service';

async function bootstrap() {
  let port = 3000;
  let app;

  do {
    try {
      app = await NestFactory.create(AppModule);
      await app.listen(port);
    } catch (e) {
      if (e.code === 'EADDRINUSE') {
        port++;
      } else {
        throw e;
      }
    }
  } while (!app);

  console.log(`Listening on port ${port}`);

  app.useGlobalPipes(new ValidationPipe());

  const keyPressService = app.get(KeypressService);
  keyPressService.listen(app);
}
bootstrap();
