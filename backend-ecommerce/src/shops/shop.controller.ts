import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { Shop } from './entities/shop.entity';

@Controller('shops')
export class ShopController { // Nommé ShopController pour la clarté
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  async findAll(): Promise<Shop[]> {
    return this.shopsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Shop> {
    const shop = await this.shopsService.findOne(id);
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }
    return shop;
  }
} 