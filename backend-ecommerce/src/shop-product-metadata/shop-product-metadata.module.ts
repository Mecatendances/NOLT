import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopProductMetadataEntity } from './entities/shop-product-metadata.entity';
import { ShopProductMetadataService } from './shop-product-metadata.service';
// Importer le ShopsModule si on a besoin du ShopsService pour valider le shopId, ou CatalogModule
// import { ShopsModule } from '../shops/shops.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopProductMetadataEntity]),
    // ShopsModule, // Décommenter si ShopsService est nécessaire
  ],
  providers: [ShopProductMetadataService],
  exports: [ShopProductMetadataService], // Exporter le service pour qu'il soit utilisable ailleurs (ex: CatalogService)
})
export class ShopProductMetadataModule {} 