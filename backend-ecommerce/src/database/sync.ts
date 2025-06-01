import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'ecommerce',
  entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: true,
  logging: true,
});

async function syncDatabase() {
  try {
    await dataSource.initialize();
    console.log('✅ Base de données synchronisée avec succès');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation de la base de données:', error);
    process.exit(1);
  }
}

syncDatabase(); 