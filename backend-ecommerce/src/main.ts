import * as dotenv from 'dotenv';
dotenv.config(); // ✅ FORÇAGE du chargement de .env

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Définir un préfixe global pour toutes les routes
  app.setGlobalPrefix('api');
  
  // Configuration CORS pour le frontend
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  
  await app.listen(port, '0.0.0.0');
  console.log(`
🚀 API démarrée sur : http://localhost:${port}/api
`);
}

bootstrap();