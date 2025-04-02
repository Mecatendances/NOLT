import { Controller, Get, Query } from '@nestjs/common';
import { DolibarrService } from './dolibarr.service';

@Controller('dolibarr')
export class DolibarrController {
  constructor(private readonly dolibarrService: DolibarrService) {}

  @Get('products')
  async getProducts(
    @Query('category') categoryId?: string, // 🔍 Type initialement string
    @Query('limit') limit = 100,
    @Query('page') page = 0,
    @Query('includeStock') includeStock = 'false'
  ) {
    // ✅ Conversion de la catégorie en number (si fournie)
    const category = categoryId ? Number(categoryId) : undefined;
    const stock = includeStock === 'true';

    return this.dolibarrService.getProducts(category, limit, page, stock);
  }

  @Get('categories')
  async getCategories() {
    return this.dolibarrService.getCategories();
  }
}
