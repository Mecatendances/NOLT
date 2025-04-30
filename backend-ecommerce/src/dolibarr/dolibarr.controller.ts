import { Controller, Get, Query, Param } from '@nestjs/common';
import { DolibarrService } from './dolibarr.service';
import { DolibarrProduct, CategoryTree } from './interfaces';

@Controller('api/dolibarr')
export class DolibarrController {
  constructor(
    private readonly dolibarrService: DolibarrService
  ) {}

  // Produits
  @Get('products')
  async getProducts(
    @Query('category') categoryId?: string,
    @Query('page') page = 0,
    @Query('includeStock') includeStock = 'false'
  ) {
    const category = categoryId ? Number(categoryId) : undefined;
    const stock = includeStock === 'true';
    return this.dolibarrService.getProducts(category, page, stock);
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.dolibarrService.getProduct(id);
  }

  // Catégories
  @Get('categories')
  async getCategories() {
    return this.dolibarrService.getCategories();
  }

  @Get('categories/tree')
  async getCategoryTree() {
    return this.dolibarrService.getCategoryTree();
  }

  @Get('categories/:id/products')
  async getCategoryProducts(@Param('id') categoryId: string) {
    return this.dolibarrService.getCategoryProducts(categoryId);
  }
}