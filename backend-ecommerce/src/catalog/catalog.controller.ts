import { Controller, Get, Query, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /* Produits */
  @Get('products')
  getProducts(@Query('category') category?: string) {
    return this.catalogService.getProducts(category);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.catalogService.getProduct(id);
  }

  /* Catégories */
  @Get('categories')
  getCategories(@Query('parent') parent?: string) {
    return this.catalogService.getCategories(parent);
  }

  @Get('categories/:id')
  getCategory(@Param('id') id: string) {
    return this.catalogService.getCategory(id);
  }
} 