import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopProductMetadataEntity } from './entities/shop-product-metadata.entity';
// Importer ShopsService si nécessaire pour valider l'existence de shopId
// import { ShopsService } from '../shops/shops.service'; 
// Importer le service de produit Dolibarr si nécessaire pour valider productId
// import { DolibarrProductsService } from '../dolibarr/products.service';

export interface UpdateShopProductMetadataDto {
  customWebLabel?: string;
  // autres champs...
}

@Injectable()
export class ShopProductMetadataService {
  constructor(
    @InjectRepository(ShopProductMetadataEntity)
    private metadataRepository: Repository<ShopProductMetadataEntity>,
    // private readonly shopsService: ShopsService, // Décommenter et injecter si validation de shopId
    // private readonly dolibarrProductsService: DolibarrProductsService, // Décommenter pour valider productId
  ) {}

  async upsertMetadata(
    shopId: string,
    productId: number,
    data: UpdateShopProductMetadataDto,
  ): Promise<ShopProductMetadataEntity> {
    // Optionnel : Valider que shopId et productId existent réellement
    // Ex: const shopExists = await this.shopsService.findOne(shopId);
    // if (!shopExists) throw new NotFoundException('Shop not found');
    // Ex: const productExists = await this.dolibarrProductsService.findOne(productId);
    // if (!productExists) throw new NotFoundException('Product not found (Dolibarr)');

    let metadata = await this.metadataRepository.findOne({
      where: { shopId, productId },
    });

    if (metadata) {
      // Mise à jour
      Object.assign(metadata, data);
    } else {
      // Création
      metadata = this.metadataRepository.create({
        shopId,
        productId,
        ...data,
      });
    }
    return this.metadataRepository.save(metadata);
  }

  async getMetadata(
    shopId: string,
    productId: number,
  ): Promise<ShopProductMetadataEntity | null> {
    return this.metadataRepository.findOne({
      where: { shopId, productId },
    });
  }

  async getBulkMetadata(
    shopId: string,
    productIds: number[],
  ): Promise<ShopProductMetadataEntity[]> {
    if (productIds.length === 0) return [];
    return this.metadataRepository.createQueryBuilder('metadata')
      .where('metadata.shopId = :shopId', { shopId })
      .andWhere('metadata.productId IN (:...productIds)', { productIds })
      .getMany();
  }

  // On pourrait ajouter une méthode pour gérer les images custom ici plus tard
} 