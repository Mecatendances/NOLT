import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../dolibarr/entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductsController } from './controllers/products.controller';
import { ProductImageController } from './controllers/product-image.controller';
import { ProductsService } from './services/products.service';
import { ProductImageService } from './services/product-image.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, ProductImage]),
  ],
  controllers: [ProductsController, ProductImageController],
  providers: [ProductsService, ProductImageService],
  exports: [ProductsService, ProductImageService],
})
export class ProductsModule {} 