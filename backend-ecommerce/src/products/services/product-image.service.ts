import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from '../entities/product-image.entity';
import { ProductEntity } from '../../dolibarr/entities/product.entity';

@Injectable()
export class ProductImageService {
  private readonly logger = new Logger(ProductImageService.name);

  constructor(
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async addImage(productId: string | number, file: Express.Multer.File): Promise<ProductImage> {
    this.logger.debug(`🔍 Recherche du produit ${productId}`);
    const product = await this.productRepository.findOne({ where: { id: Number(productId) } });
    
    if (!product) {
      this.logger.error(`❌ Produit ${productId} non trouvé`);
      throw new Error('Product not found');
    }

    this.logger.debug(`✅ Produit trouvé: ${product.label}`);

    const image = new ProductImage();
    image.url = `/uploads/products/${file.filename}`;
    image.alt = product.label;
    image.product = product;

    this.logger.debug(`📝 Création de l'entrée image:`, image);

    // Si c'est la première image, la définir comme image principale
    const imageCount = await this.productImageRepository.count({ where: { product: { id: Number(productId) } } });
    this.logger.debug(`📊 Nombre d'images existantes: ${imageCount}`);

    if (imageCount === 0) {
      this.logger.debug(`🎯 Première image pour ce produit`);
      await this.productRepository.save(product);
    }

    try {
      const savedImage = await this.productImageRepository.save(image);
      this.logger.debug(`✅ Image sauvegardée avec succès:`, savedImage);
      return savedImage;
    } catch (error) {
      this.logger.error(`❌ Erreur lors de la sauvegarde de l'image:`, error);
      throw error;
    }
  }

  async getProductImages(productId: string | number): Promise<ProductImage[]> {
    return this.productImageRepository.find({
      where: { product: { id: Number(productId) } },
      order: { order: 'ASC' }
    });
  }

  async deleteImage(imageId: number): Promise<void> {
    const image = await this.productImageRepository.findOne({
      where: { id: imageId },
      relations: ['product']
    });

    if (!image) {
      throw new Error('Image not found');
    }

    await this.productImageRepository.remove(image);
  }

  async reorderImages(productId: string | number, imageIds: number[]): Promise<void> {
    for (let i = 0; i < imageIds.length; i++) {
      await this.productImageRepository.update(
        { id: imageIds[i] },
        { order: i }
      );
    }
  }
} 