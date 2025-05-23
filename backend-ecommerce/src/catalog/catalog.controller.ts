import { Controller, Get, Query, Param, Put, Body, ParseUUIDPipe } from '@nestjs/common';
import { CatalogService } from './catalog.service';

// DTO pour le body de la requête de mise à jour du webLabel
class UpdateWebLabelDto {
  customWebLabel: string;
}

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /* Produits */
  @Get('products')
  async getProducts(
    @Query('category') category?: string,
    @Query('shopId') shopId?: string, // Ajout pour filtrer par shopId
  ) {
    const products = await this.catalogService.getProducts(category, shopId);
    // Le mapping pour enlever les entités complètes d'images est toujours utile pour le client léger
    return products.map(p => ({
      ...p,
      images: (p.images || [])
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((img: any) => img.url),
    }));
  }

  @Get('products/:id')
  async getProduct(
    @Param('id') id: string, 
    @Query('shopId') shopId?: string, // Ajout pour récupérer le webLabel custom
  ) {
    const prod = await this.catalogService.getProduct(id, shopId);
    if (!prod) return null;
    return {
      ...prod,
      images: (prod.images || [])
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((img: any) => img.url),
    };
  }

  // Nouvelle route pour mettre à jour le customWebLabel
  @Put('shops/:shopId/products/:productId/web-label')
  async updateShopProductWebLabel(
    @Param('shopId') shopId: string, // ParseUUIDPipe si shopId est un UUID
    @Param('productId') productId: string,
    @Body() body: UpdateWebLabelDto,
  ) {
    return this.catalogService.updateShopProductWebLabel(
      shopId,
      productId,
      body.customWebLabel,
    );
  }

  @Get('shops/by-dolibarr-category/:dolibarrCategoryId')
  async getShopByDolibarrCategoryId(@Param('dolibarrCategoryId') dolibarrCategoryId: string) {
    return this.catalogService.findShopByDolibarrCategoryId(dolibarrCategoryId);
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

  @Get('categoriesFilles/:id')
  getCategoriesFilles(@Param('id') id: string) {
    // Sous-catégories directes depuis la BDD locale
    return this.catalogService.getCategories(id);
  }

  @Get('categories/:id/products')
  async getProductsByCategory(
    @Param('id') id: string,
    @Query('shopId') shopId?: string, // AJOUT: Accepter shopId
  ) {
    const prods = await this.catalogService.getProducts(id, shopId); // MODIFICATION: Passer shopId
    return prods.map(p => ({
      ...p,
      images: (p.images || [])
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((img: any) => img.url),
    }));
  }
} 