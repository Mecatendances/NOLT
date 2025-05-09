import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DolibarrController } from './dolibarr.controller';
import { DolibarrService } from './dolibarr.service';
import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from './entities/product.entity';
import { DolibarrSyncService } from './dolibarr-sync.service';
import { DolibarrSyncTask } from './dolibarr-sync.task';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([CategoryEntity, ProductEntity])
  ],
  controllers: [DolibarrController],
  providers: [DolibarrService, DolibarrSyncService, DolibarrSyncTask],
  exports: [DolibarrService, DolibarrSyncService]
})
export class DolibarrModule {}
