import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../dolibarr/entities/product.entity';
import { CategoryEntity } from '../dolibarr/entities/category.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  /* Produits ------------------------------------------------------ */

  async getProducts(categoryId?: string): Promise<ProductEntity[]> {
    console.log(`🔍 Recherche de produits ${categoryId ? `pour la catégorie ${categoryId}` : 'tous'}`);
    
    if (categoryId) {
      try {
        console.log(`📊 Exécution de la requête avec jointure sur la catégorie ${categoryId}`);
        
        // D'abord, vérifier si la catégorie existe
        const categoryExists = await this.categoryRepository.findOne({ where: { id: categoryId } });
        console.log(`🏷️ Catégorie ${categoryId} existe: ${!!categoryExists}`);
        
        // Ensuite, compter les associations dans product_categories
        const count = await this.productRepository.manager.query(
          'SELECT COUNT(*) FROM product_categories WHERE category_id = $1',
          [categoryId]
        );
        console.log(`🔢 Nombre d'associations produit-catégorie pour ${categoryId}: ${count[0].count}`);
        
        // Exécuter la requête
        const products = await this.productRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.categories', 'category')
          .where('category.id = :categoryId', { categoryId })
          .getMany();
        
        console.log(`📦 ${products.length} produits trouvés pour la catégorie ${categoryId}`);
        return products;
      } catch (error) {
        console.error(`❌ Erreur lors de la recherche des produits par catégorie ${categoryId}:`, error);
        throw error;
      }
    }
    
    console.log('📊 Récupération de tous les produits avec leurs catégories');
    const allProducts = await this.productRepository.find({ 
      relations: ['categories'] 
    });
    console.log(`📦 ${allProducts.length} produits trouvés au total`);
    return allProducts;
  }

  async getProduct(id: string): Promise<ProductEntity | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
  }

  /* Catégories ---------------------------------------------------- */

  async getCategories(parentId?: string): Promise<CategoryEntity[]> {
    if (parentId) {
      return this.categoryRepository.find({ where: { fkParent: parentId } });
    }
    return this.categoryRepository.find();
  }

  async getCategory(id: string): Promise<CategoryEntity | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }
} 