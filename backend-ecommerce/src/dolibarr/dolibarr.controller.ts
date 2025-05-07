import { Controller, Get, Query, Param } from '@nestjs/common';
import { DolibarrService } from './dolibarr.service';
import { DolibarrSyncService } from './dolibarr-sync.service';
import { DolibarrProduct, CategoryTree } from './interfaces';

@Controller('dolibarr')
export class DolibarrController {
  constructor(
    private readonly dolibarrService: DolibarrService,
    private readonly dolibarrSyncService: DolibarrSyncService
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

  @Get('noltapi/categoriesFilles/:id')
  async getCategoriesFilles(@Param('id') categoryId: string) {
    return this.dolibarrService.getCategoriesFilles(categoryId);
  }

  @Get('sync')
  async syncDolibarr(@Query('category') categoryId?: string) {
    return this.dolibarrSyncService.sync(categoryId);
  }
}