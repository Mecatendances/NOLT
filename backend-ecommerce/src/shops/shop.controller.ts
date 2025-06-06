import { Controller, Get, Param, NotFoundException, UseGuards, Request } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { Shop } from './entities/shop.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserShopRoleService } from '../users/services/user-shop-role.service';
import { ShopRole } from '../users/user-role.enum';

@Controller('shops')
export class ShopController {
  constructor(
    private readonly shopsService: ShopsService,
    private readonly userShopRoleService: UserShopRoleService
  ) {}

  @Get('public')
  async findAllPublic(): Promise<Shop[]> {
    return this.shopsService.findAllPublic();
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

  @Get()
  async findAll(): Promise<Shop[]> {
    return this.shopsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Shop> {
    console.log(`Requête GET /shops/${id} reçue`);
    try {
      const shop = await this.shopsService.findOne(id);
      if (!shop) {
        console.log(`Boutique non trouvée pour l'ID: ${id}`);
        throw new NotFoundException(`Shop with ID ${id} not found`);
      }
      console.log(`Boutique trouvée: ${shop.name}`);
      return shop;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la boutique ${id}:`, error);
      throw error;
    }
  }
} 