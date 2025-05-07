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
    if (categoryId) {
      return this.productRepository.find({
        where: { category: { id: categoryId } },
        relations: ['category'],
      });
    }
    return this.productRepository.find({ relations: ['category'] });
  }

  async getProduct(id: string): Promise<ProductEntity | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['category'],
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