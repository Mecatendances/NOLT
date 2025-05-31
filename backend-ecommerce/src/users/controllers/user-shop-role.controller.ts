import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ShopRolesGuard } from '../../auth/shop-roles.guard';
import { ShopRoles } from '../../auth/decorators/shop-roles.decorator';
import { UserShopRoleService } from '../services/user-shop-role.service';
import { ShopRole } from '../user-role.enum';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GlobalRole } from '../user-role.enum';

@Controller('shops/:shopId/roles')
@UseGuards(JwtAuthGuard, ShopRolesGuard)
export class UserShopRoleController {
  constructor(private readonly userShopRoleService: UserShopRoleService) {}

  @Post()
  @Roles(GlobalRole.SUPERADMIN)
  @ShopRoles(ShopRole.SHOP_ADMIN)
  async assignRole(
    @Param('shopId') shopId: string,
    @Body() body: { userId: string; role: ShopRole }
  ) {
    return this.userShopRoleService.assignRoleToUser(body.userId, shopId, body.role);
  }

  @Get()
  @Roles(GlobalRole.SUPERADMIN)
  @ShopRoles(ShopRole.SHOP_ADMIN)
  async getShopRoles(@Param('shopId') shopId: string) {
    return this.userShopRoleService.getUsersByShopRole(shopId, ShopRole.SHOP_ADMIN);
  }

  @Get('user/:userId')
  @Roles(GlobalRole.SUPERADMIN)
  @ShopRoles(ShopRole.SHOP_ADMIN)
  async getUserRoles(
    @Param('shopId') shopId: string,
    @Param('userId') userId: string
  ) {
    return this.userShopRoleService.getUserShopRoles(userId, shopId);
  }

  @Delete('user/:userId')
  @Roles(GlobalRole.SUPERADMIN)
  @ShopRoles(ShopRole.SHOP_ADMIN)
  async removeRole(
    @Param('shopId') shopId: string,
    @Param('userId') userId: string
  ) {
    await this.userShopRoleService.removeRole(userId, shopId);
    return { success: true };
  }

  @Get('/users')
  @Roles(GlobalRole.SUPERADMIN)
  @ShopRoles(ShopRole.SHOP_ADMIN)
  async getAllShopUsers(@Param('shopId') shopId: string) {
    return this.userShopRoleService.getAllUsersForShop(shopId);
  }
}

// Endpoint global pour le superadmin
import { Controller as GlobalController, Get as GlobalGet, UseGuards as GlobalUseGuards } from '@nestjs/common';

@GlobalController('user-shop-roles')
@GlobalUseGuards(JwtAuthGuard)
export class UserShopRoleGlobalController {
  constructor(private readonly userShopRoleService: UserShopRoleService) {}

  @GlobalGet()
  @Roles(GlobalRole.SUPERADMIN)
  async getAllUserShopRoles() {
    return this.userShopRoleService.getAllUserShopRoles();
  }
} 