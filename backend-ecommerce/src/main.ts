import * as dotenv from 'dotenv';
dotenv.config(); // ✅ FORÇAGE du chargement de .env

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 4000; // Utiliser 4000 par défaut
  await app.listen(port, '0.0.0.0'); // Écoute sur toutes les interfaces
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();

