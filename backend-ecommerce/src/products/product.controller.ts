import { Controller, Get } from '@nestjs/common';
import { DolibarrService } from '../dolibarr/dolibarr.service';

@Controller('products')
export class ProductController {
  constructor(private readonly dolibarrService: DolibarrService) {}

  @Get()
  async getAllProducts() {
    return await this.dolibarrService.getProducts();
  }
}
