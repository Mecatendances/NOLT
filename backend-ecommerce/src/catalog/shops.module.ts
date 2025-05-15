import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopEntity } from './shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopEntity])],
  exports: [TypeOrmModule],
})
export class ShopsModule {} 