import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { ProductEntity } from '../dolibarr/entities/product.entity';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async findAll() {
    return this.shopRepository.find();
  }

  async findOne(id: string) {
    return this.shopRepository.findOneBy({ id });
  }

  async updateProductImage(productId: string, imageUrl: string) {
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Produit introuvable');
    product.imageUrl = imageUrl;
    return this.productRepository.save(product);
  }

  async updateProductWebLabel(productId: string, webLabel: string) {
    console.log('[updateProductWebLabel] productId:', productId, 'webLabel:', webLabel);
    const product = await this.productRepository.findOneBy({ id: productId });
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
} 