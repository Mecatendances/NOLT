import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DolibarrController } from './dolibarr.controller';
import { DolibarrService } from './dolibarr.service';
import { CategoryEntity } from '../catalog/entities/category.entity';
import { ProductEntity } from '../catalog/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';
import { DolibarrSyncService } from './dolibarr-sync.service';
import { DolibarrSyncTask } from './dolibarr-sync.task';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([CategoryEntity, ProductEntity, Shop])
  ],
  controllers: [DolibarrController],
  providers: [DolibarrService, DolibarrSyncService, DolibarrSyncTask],
  exports: [DolibarrService, DolibarrSyncService]
})
export class DolibarrModule {}
