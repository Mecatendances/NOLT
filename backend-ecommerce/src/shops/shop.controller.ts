import { Controller, Get, Param, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { Shop } from './entities/shop.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserShopRoleService } from '../users/services/user-shop-role.service';
import { ShopRole } from '../users/user-role.enum';

@Controller('shops')
export class ShopController { // Nommé ShopController pour la clarté
  constructor(
    private readonly shopsService: ShopsService,
    private readonly userShopRoleService: UserShopRoleService
  ) {}

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

  @Get('admin/my-shops')
  @UseGuards(JwtAuthGuard)
  async getMyAdminShops(@Request() req) {
    const userId = req.user.sub;
    const userShopRoles = await this.userShopRoleService.getUserShopRoles(userId, null);
    const adminShops = userShopRoles
      .filter(role => role.role === ShopRole.SHOP_ADMIN)
      .map(role => role.shop);
    return adminShops;
  }
} 