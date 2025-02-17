import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CORS } from './constants';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(CORS);
  app.use(json({ limit: '10mb' })); // Establece el límite que necesites
  app.use(urlencoded({ limit: '10mb', extended: true })); // Para solicitudes multipart



  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
