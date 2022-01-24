import { NestFactory } from '@nestjs/core';
import MainAdapter from './adapter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new MainAdapter(app))
  await app.listen(4000);
}
bootstrap();
