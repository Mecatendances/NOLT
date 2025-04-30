import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DolibarrModule } from './dolibarr/dolibarr.module';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { AdminModule } from './admin/admin.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DolibarrModule,
    AdminModule,
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
