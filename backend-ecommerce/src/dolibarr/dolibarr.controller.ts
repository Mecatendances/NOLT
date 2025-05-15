import { Controller, Get, Post, Query, Param, Patch, Body } from '@nestjs/common';
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

  @Post('sync/product-categories')
  async syncProductCategories() {
    await this.dolibarrSyncService.syncProductCategories();
    return { message: 'Synchronisation des associations produit-catégorie terminée avec succès' };
  }

  @Post('sync/product-categories/alternative')
  async syncProductCategoriesAlternative() {
    await this.dolibarrSyncService.syncProductCategoriesAlternative();
    return { message: 'Synchronisation alternative des associations produit-catégorie terminée avec succès' };
  }

  @Post('sync/product-categories/correct')
  async syncProductCategoriesCorrect() {
    await this.dolibarrSyncService.syncProductCategoriesCorrect();
    return { message: 'Synchronisation correcte des associations produit-catégorie terminée avec succès' };
  }

  @Post('fix-product-categories-manually')
  async fixProductCategoriesManually() {
    try {
      const associations = [
        { productId: "6", categoryId: "179" },
        { productId: "6", categoryId: "188" },
        { productId: "42", categoryId: "8" },
        { productId: "42", categoryId: "184" },
        { productId: "43", categoryId: "49" },
        { productId: "45", categoryId: "21" },
        { productId: "45", categoryId: "185" },
        { productId: "60", categoryId: "83" },
        { productId: "65", categoryId: "91" },
        { productId: "67", categoryId: "70" },
        { productId: "69", categoryId: "155" },
        { productId: "73", categoryId: "71" },
        { productId: "75", categoryId: "59" },
        { productId: "80", categoryId: "187" },
        { productId: "92", categoryId: "14" },
        { productId: "98", categoryId: "86" },
        { productId: "99", categoryId: "90" },
        { productId: "106", categoryId: "74" },
        { productId: "109", categoryId: "75" },
        { productId: "129", categoryId: "84" },
        { productId: "130", categoryId: "52" },
        { productId: "132", categoryId: "56" },
        { productId: "134", categoryId: "29" },
        { productId: "147", categoryId: "34" },
        { productId: "152", categoryId: "60" },
        { productId: "153", categoryId: "61" },
        { productId: "164", categoryId: "53" },
        { productId: "171", categoryId: "138" },
        { productId: "173", categoryId: "139" },
        { productId: "182", categoryId: "189" },
        { productId: "184", categoryId: "186" },
        { productId: "186", categoryId: "186" },
        { productId: "277", categoryId: "95" },
        { productId: "278", categoryId: "97" },
        { productId: "279", categoryId: "107" },
        { productId: "280", categoryId: "108" },
        { productId: "296", categoryId: "50" },
        { productId: "297", categoryId: "57" },
        { productId: "298", categoryId: "114" },
        { productId: "299", categoryId: "115" },
        { productId: "300", categoryId: "89" },
        { productId: "350", categoryId: "148" },
        { productId: "366", categoryId: "133" },
        { productId: "367", categoryId: "132" },
        { productId: "368", categoryId: "146" },
        { productId: "369", categoryId: "145" },
        { productId: "370", categoryId: "147" },
        { productId: "371", categoryId: "170" },
        { productId: "372", categoryId: "168" },
        { productId: "373", categoryId: "172" }
      ];
      
      return await this.dolibarrSyncService.insertManualAssociations(associations);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Patch('products/:id/web-label')
  async updateWebLabel(@Param('id') id: string, @Body('webLabel') webLabel: string) {
    return this.dolibarrService.updateWebLabel(id, webLabel);
  }
}