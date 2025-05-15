import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DolibarrModule } from './dolibarr/dolibarr.module';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { AdminModule } from './admin/admin.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { UsersModule } from './users/users.module';
import { ShopsModule } from './shops/shops.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DolibarrModule,
    AdminModule,
    DatabaseModule,
    ScheduleModule.forRoot(),
    CatalogModule,
    OrdersModule,
    CampaignsModule,
    UsersModule,
    ShopsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '80PmrhDuCIBO61Z1',
      database: 'ecommerce',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, TenantMiddleware)
      .forRoutes('*');
  }
}
