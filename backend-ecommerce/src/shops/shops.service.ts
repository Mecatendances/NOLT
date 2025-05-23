import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { ProductEntity } from '../dolibarr/entities/product.entity';
import { ProductImageService } from '../products/services/product-image.service';
import { CatalogService } from '../catalog/catalog.service';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    private productImageService: ProductImageService,
    private catalogService: CatalogService,
  ) {}

  async findAll() {
    return this.shopRepository.find();
  }

  async findOne(id: string): Promise<Shop | null> {
    const shop = await this.shopRepository.findOneBy({ id });
    if (!shop) {
      return null;
    }

    if (shop.dolibarrCategoryId) {
      const products = await this.catalogService.getProducts(String(shop.dolibarrCategoryId), shop.id);
      (shop as any).products = products;
    } else {
      (shop as any).products = [];
    }
    
    return shop;
  }

  async updateProductWebLabel(productId: string, webLabel: string) {
    console.log('[updateProductWebLabel] productId:', productId, 'webLabel:', webLabel);
    const numericId = Number(productId);
    const product = await this.productRepository.findOneBy({ id: numericId });
    console.log('[updateProductWebLabel] Produit trouvé:', product);
    if (!product) {
      console.error('[updateProductWebLabel] Produit introuvable pour productId:', productId);
      throw new NotFoundException('Produit introuvable');
    }
    product.webLabel = webLabel;
    const saved = await this.productRepository.save(product);
    console.log('[updateProductWebLabel] Produit sauvegardé:', saved);
    return saved;
  }

  async addProductImage(productId: string, file: Express.Multer.File) {
    return this.productImageService.addImage(productId, file);
  }
} 