import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASS', 'postgres'),
        database: config.get<string>('DB_NAME', 'ecommerce'),
        entities: [__dirname + '/../**/*.entity.{ts,js}'],
        synchronize: true, // Activé pour le développement
        logging: true,
        autoLoadEntities: true,
        ssl: false,
        extra: {
          max: 20, // Nombre maximum de connexions dans le pool
          connectionTimeoutMillis: 5000, // Timeout de connexion
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {} 