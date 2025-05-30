import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsController as DolibarrProductsShopController } from './shops.controller';
import { ShopController } from './shop.controller';
import { ShopsService } from './shops.service';
import { Shop } from './entities/shop.entity';
import { ProductEntity } from '../catalog/entities/product.entity';
import { ProductsModule } from '../products/products.module';
import { CatalogModule } from '../catalog/catalog.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, ProductEntity]),
    ProductsModule,
    CatalogModule,
    UsersModule,
  ],
  controllers: [
    DolibarrProductsShopController,
    ShopController,
  ],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {} 