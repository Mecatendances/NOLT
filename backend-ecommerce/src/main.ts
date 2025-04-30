import * as dotenv from 'dotenv';
dotenv.config(); // ✅ FORÇAGE du chargement de .env

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configuration CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Préfixe global pour l'API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  
  // Au lieu d'utiliser getHttpAdapter(), nous allons gérer la redirection dans le AppController
  await app.listen(port, '0.0.0.0');
  console.log(`
🚀 Serveur démarré avec succès !
📡 API disponible sur : http://localhost:${port}/api
🏠 Page d'accueil : http://localhost:${port}
📦 Vue des produits : http://localhost:${port}/api/dolibarr/products-view
🌳 Arborescence des catégories : http://localhost:${port}/api/dolibarr/categories/tree
  `);
}
bootstrap();

