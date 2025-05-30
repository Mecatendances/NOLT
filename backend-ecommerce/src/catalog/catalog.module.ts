import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { CategoryEntity } from './entities/category.entity';
import { ProductCategoryEntity } from './entities/product-category.entity';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Shop } from '../shops/entities/shop.entity';
import { ShopProductMetadataModule } from '../shop-product-metadata/shop-product-metadata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity, 
      CategoryEntity,
      ProductCategoryEntity,
      Shop
    ]),
    ShopProductMetadataModule,
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {} 