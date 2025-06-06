import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './entities/shop.entity';
import { ProductEntity } from '../catalog/entities/product.entity';
import { ProductImageService } from '../products/services/product-image.service';
import { CatalogService } from '../catalog/catalog.service';
import { UpdateShopBrandingDto } from './dto/update-shop-branding.dto';

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
    console.log(`Recherche de la boutique avec l'ID: ${id}`);
    const shop = await this.shopRepository.findOneBy({ id });
    console.log('Résultat de la recherche:', shop ? 'Boutique trouvée' : 'Boutique non trouvée');
    
    if (!shop) {
      console.log(`Aucune boutique trouvée avec l'ID: ${id}`);
      return null;
    }

    if (shop.dolibarrCategoryId) {
      console.log(`Recherche des produits pour la catégorie Dolibarr: ${shop.dolibarrCategoryId}`);
      const category = await this.catalogService.findCategoryByDolibarrId(shop.dolibarrCategoryId);
      let products = [];
      if (category) {
        console.log(`Catégorie trouvée, récupération des produits pour la boutique: ${shop.id}`);
        products = await this.catalogService.getProducts(String(category.id), shop.id);
        console.log(`Nombre de produits trouvés: ${products.length}`);
      } else {
        console.log(`Aucune catégorie trouvée pour l'ID Dolibarr: ${shop.dolibarrCategoryId}`);
      }
      (shop as any).products = products;
    } else {
      console.log('Aucun ID de catégorie Dolibarr associé à la boutique');
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

  async findAllPublic() {
    return this.shopRepository.find({ where: { isPublic: true } });
  }

  async getBrandingSettings(shopId: string) {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      select: [
        'id',
        'name',
        'description',
        'logo',
        'coverImage',
        'primaryColor',
        'secondaryColor',
        'socialLinks',
        'footerText',
        'contactEmail'
      ]
    });

    if (!shop) {
      throw new NotFoundException('Boutique non trouvée');
    }

    return shop;
  }

  async updateBrandingSettings(shopId: string, settings: UpdateShopBrandingDto) {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId }
    });

    if (!shop) {
      throw new NotFoundException('Boutique non trouvée');
    }

    // Mise à jour des champs de personnalisation
    Object.assign(shop, settings);

    await this.shopRepository.save(shop);
    return shop;
  }

  async uploadBrandingImage(shopId: string, type: string, file: Express.Multer.File) {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId }
    });

    if (!shop) {
      throw new NotFoundException('Boutique non trouvée');
    }

    // Vérification du type d'image
    if (!['logo', 'coverImage'].includes(type)) {
      throw new BadRequestException('Type d\'image invalide');
    }

    // Construction de l'URL de l'image
    const imageUrl = `/uploads/${type}-${shopId}.${file.originalname.split('.').pop()}`;

    // Mise à jour du champ correspondant
    shop[type] = imageUrl;
    await this.shopRepository.save(shop);

    return { url: imageUrl };
  }
} 