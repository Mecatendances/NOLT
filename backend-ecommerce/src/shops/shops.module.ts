import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { Shop } from './entities/shop.entity';
import { ProductEntity } from '../dolibarr/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, ProductEntity])],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {} 