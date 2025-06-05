import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CategoryEntity } from './entities/category.entity';
import { ShopProductMetadataService, UpdateShopProductMetadataDto } from '../shop-product-metadata/shop-product-metadata.service';
import { Shop } from '../shops/entities/shop.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly shopProductMetadataService: ShopProductMetadataService,
  ) {}

  /* Produits ------------------------------------------------------ */

  // Récupère récursivement tous les IDs locaux des sous-catégories à partir d'un dolibarrId racine
  private async getAllSubCategoryIdsFromDolibarrId(dolibarrId: number): Promise<number[]> {
    const root = await this.categoryRepository.findOne({ where: { dolibarrId } });
    if (!root) return [];
    const all = await this.categoryRepository.find();
    const result: number[] = [];
    const stack = all.filter(cat => cat.fkParent === root.id).map(cat => cat.id); // Commence par les enfants directs

    while (stack.length) {
      const current = stack.pop();
      result.push(current);
      const children = all.filter(cat => cat.fkParent === current);
      for (const child of children) {
        stack.push(child.id);
      }
    }
    console.log(`[getAllSubCategoryIdsFromDolibarrId] Sous-catégories trouvées pour dolibarrId=${dolibarrId} (racine locale id=${root.id}):`, result);
    return result;
  }

  async getProducts(categoryId?: string, shopId?: string): Promise<ProductEntity[]> {
    console.log(`🔍 Recherche de produits ${categoryId ? `pour la catégorie ${categoryId}` : 'tous'} ${shopId ? `pour la boutique ${shopId}` : ''}`);
    let products: ProductEntity[];

    if (categoryId) {
      try {
        // 1. On tente d'abord de trouver une catégorie par dolibarrId
        const categoryByDolibarr = await this.categoryRepository.findOne({ where: { dolibarrId: Number(categoryId) } });
        if (categoryByDolibarr) {
          // On récupère toutes les sous-catégories (récursif)
          const allCatIds = await this.getAllSubCategoryIdsFromDolibarrId(Number(categoryId));
          if (allCatIds.length === 0) {
            console.log(`[getProducts] Aucune sous-catégorie trouvée pour dolibarrId=${categoryId} (racine locale id=${categoryByDolibarr.id})`);
            return [];
          }
          console.log(`[getProducts] Recherche produits pour sous-catégories (ids) :`, allCatIds);
          products = await this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.categories', 'category')
            .leftJoinAndSelect('product.images', 'images')
            .where('category.category_id IN (:...catIds)', { catIds: allCatIds })
            .getMany();
          console.log(`📦 ${products.length} produits trouvés pour la catégorie Dolibarr ${categoryId} (et ses sous-catégories)`);
        } else {
          // 2. Sinon, on tente par id local
          const categoryById = await this.categoryRepository.findOne({ where: { id: Number(categoryId) } });
          if (!categoryById) {
            console.log(`[getProducts] Aucune catégorie trouvée pour id local=${categoryId}`);
            return [];
          }
          // On regarde s'il y a des sous-catégories
          const subcats = await this.categoryRepository.find({ where: { fkParent: categoryById.id } });
          if (subcats.length > 0) {
            const allCatIds = subcats.map(cat => cat.id);
            console.log(`[getProducts] Recherche produits pour sous-catégories directes de la racine locale id=${categoryById.id} :`, allCatIds);
            products = await this.productRepository
              .createQueryBuilder('product')
              .leftJoinAndSelect('product.categories', 'category')
              .leftJoinAndSelect('product.images', 'images')
              .where('category.category_id IN (:...catIds)', { catIds: allCatIds })
              .getMany();
            console.log(`📦 ${products.length} produits trouvés pour les sous-catégories de la racine locale ${categoryId}`);
          } else {
            // fallback : produits de la catégorie locale elle-même
            products = await this.productRepository
              .createQueryBuilder('product')
              .leftJoinAndSelect('product.categories', 'category')
              .leftJoinAndSelect('product.images', 'images')
              .where('category.category_id = :categoryId', { categoryId: Number(categoryId) })
              .getMany();
            console.log(`📦 ${products.length} produits trouvés pour la catégorie locale ${categoryId}`);
          }
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la recherche des produits par catégorie ${categoryId}:`, error);
        throw error;
      }
    } else {
      console.log('📊 Récupération de tous les produits avec leurs catégories');
      products = await this.productRepository.find({ 
        relations: ['categories', 'images'] 
      });
      console.log(`📦 ${products.length} produits trouvés au total`);
    }

    if (shopId && products.length > 0) {
      const productIds = products.map(p => p.id);
      console.log('[CatalogService] Product IDs for metadata (numbers):', productIds, 'Shop ID:', shopId);

      const metadatas = await this.shopProductMetadataService.getBulkMetadata(shopId, productIds);
      console.log('[CatalogService] Metadatas received:', metadatas);

      const metadataMap = new Map(metadatas.map(m => [m.productId, m]));

      products = products.map(p => {
        const meta = metadataMap.get(p.id);
        const dolibarrPrincipalLabel = p.label;
        const dolibarrWebSpecificLabel = p.webLabel;
        const customLabel = meta?.customWebLabel;
        const calculatedWebLabelForFrontend = (customLabel && customLabel.trim() !== '') ? customLabel : dolibarrPrincipalLabel;
        console.log(`[CatalogService] Product ID ${p.id} - Dolibarr Principal Label: ${dolibarrPrincipalLabel}, Original Dolibarr Web-Specific: ${dolibarrWebSpecificLabel}, CustomMetaWebLabel: ${meta?.customWebLabel}, Final WebLabel for Frontend: ${calculatedWebLabelForFrontend}`);
        const { webLabel: _originalDolibarrWebLabelField, ...productDataWithoutOriginalWebLabel } = p;
        return {
          ...productDataWithoutOriginalWebLabel,
          webLabel: calculatedWebLabelForFrontend,
        };
      });
    }
    
    console.log(`📦 ${products.length} produits trouvés.`);
    console.log('[CatalogService] Products to be returned (sample):', JSON.stringify(products.slice(0, 2).map(p => ({id: p.id, label: p.label, webLabel: p.webLabel})), null, 2));
    return products;
  }

  async getProduct(id: string, shopId?: string): Promise<ProductEntity | null> {
    const productIdAsNumber = Number(id);
    if (isNaN(productIdAsNumber)) {
        throw new NotFoundException(`Product ID "${id}" is not a valid number`);
    }
    let product = await this.productRepository.findOne({
      where: { id: productIdAsNumber },
      relations: ['categories', 'images'],
    });

    if (product && shopId) {
      const meta = await this.shopProductMetadataService.getMetadata(shopId, product.id);
      
      const dolibarrPrincipalLabel = product.label;
      const dolibarrWebSpecificLabel = product.webLabel;
      
      const customLabel = meta?.customWebLabel;
      const calculatedWebLabelForFrontend = (customLabel && customLabel.trim() !== '') ? customLabel : dolibarrPrincipalLabel;
      
      console.log(`[CatalogService] Single Product ID ${product.id} - Dolibarr Principal Label: ${dolibarrPrincipalLabel}, Original Dolibarr Web-Specific: ${dolibarrWebSpecificLabel}, CustomMetaWebLabel: ${meta?.customWebLabel}, Final WebLabel for Frontend: ${calculatedWebLabelForFrontend}`);

      const { webLabel: _originalDolibarrWebLabelField, ...productDataWithoutOriginalWebLabel } = product;

      product = {
        ...productDataWithoutOriginalWebLabel,
        webLabel: calculatedWebLabelForFrontend,
      };
    }
    return product;
  }

  async updateShopProductWebLabel(
    shopId: string, 
    productId: string, 
    customWebLabel: string
  ): Promise<any> {
    const shop = await this.shopRepository.findOneBy({ id: shopId });
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found`);
    }

    const productIdAsNumber = Number(productId);
    if (isNaN(productIdAsNumber)) {
        throw new NotFoundException(`Product ID "${productId}" is not a valid number for update`);
    }
    const product = await this.productRepository.findOneBy({ id: productIdAsNumber });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productIdAsNumber} not found (Dolibarr)`);
    }

    const metadataPayload: UpdateShopProductMetadataDto = { customWebLabel };
    return this.shopProductMetadataService.upsertMetadata(shopId, product.id, metadataPayload);
  }

  async findShopByDolibarrCategoryId(dolibarrCategoryId: string): Promise<Shop | null> {
    const categoryIdInt = parseInt(dolibarrCategoryId, 10);
    if (isNaN(categoryIdInt)) {
      console.warn(`Tentative de recherche de boutique avec un dolibarrCategoryId non numérique: ${dolibarrCategoryId}`);
      return null;
    }
    return this.shopRepository.findOne({ where: { dolibarrCategoryId: categoryIdInt } });
  }

  async getProductsForShop(dolibarrCategoryId: string): Promise<ProductEntity[]> {
    const shop = await this.findShopByDolibarrCategoryId(dolibarrCategoryId);
    
    if (!shop) {
      console.log(`Aucune boutique trouvée pour l'ID de catégorie Dolibarr: ${dolibarrCategoryId}`);
      return [];
    }

    return this.getProducts(undefined, shop.id);
  }

  /* Catégories ---------------------------------------------------- */

  async getCategories(parentId?: string): Promise<CategoryEntity[]> {
    if (parentId) {
      return this.categoryRepository.find({ where: { parent: { id: Number(parentId) } } });
    }
    return this.categoryRepository.find();
  }

  async getCategory(id: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.findOne({ where: { id: Number(id) } });
  }

  async findCategoryByDolibarrId(dolibarrId: number) {
    return this.categoryRepository.findOne({ where: { dolibarrId } });
  }

  async getCategoriesByShop(shopId: string) {
    return this.categoryRepository.find({ where: { shopId } });
  }
} 