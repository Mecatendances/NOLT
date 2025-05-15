import * as dotenv from 'dotenv';
dotenv.config(); // ✅ FORÇAGE du chargement de .env

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  // Log des variables d'environnement pour debug
  console.log('=== Configuration Base de données ===');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_USERNAME:', process.env.DB_USERNAME);
  console.log('DB_DATABASE:', process.env.DB_DATABASE);
  console.log('===================================');

  const app = await NestFactory.create(AppModule);
  // Définir un préfixe global pour toutes les routes
  app.setGlobalPrefix('api');
  
  // Configuration CORS pour le frontend
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Servir les fichiers statiques
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const port = process.env.PORT || 3000;
  
  await app.listen(port, '0.0.0.0');
  console.log(`
🚀 API démarrée sur : http://localhost:${port}/api
`);
}

bootstrap();