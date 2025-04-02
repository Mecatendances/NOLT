import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DolibarrModule } from './dolibarr/dolibarr.module';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { ProductModule } from './products/product.module';
import { AdminModule } from './admin/admin.module';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [AuthModule, DolibarrModule, ProductModule, AdminModule], // ✅ Ajoute tous les modules ici
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, TenantMiddleware) // ✅ Applique les middlewares
      .forRoutes('*'); 
  }
}
