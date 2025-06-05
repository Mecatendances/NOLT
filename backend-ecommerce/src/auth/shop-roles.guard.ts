import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserShopRoleService } from '../users/services/user-shop-role.service';
import { ShopRole } from '../users/user-role.enum';
import { GlobalRole } from '../users/user-role.enum';

@Injectable()
export class ShopRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userShopRoleService: UserShopRoleService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<ShopRole[]>('shopRoles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const shopId = request.params.shopId || request.body.shopId;

    const userId = user.id || user.userId;
    console.log('[GUARD] user:', user);
    console.log('[GUARD] userId utilisé:', userId);
    console.log('[GUARD] shopId:', shopId);
    console.log('[GUARD] requiredRoles:', requiredRoles);

    if (!userId || !shopId) {
      console.warn('[GUARD] Utilisateur non authentifié ou boutique non spécifiée');
      throw new ForbiddenException('Utilisateur non authentifié ou boutique non spécifiée');
    }

    // Si l'utilisateur est SUPERADMIN, il a accès à tout
    if (user.role === GlobalRole.SUPERADMIN) {
      console.log('[GUARD] Accès SUPERADMIN');
      return true;
    }

    // Vérifier si l'utilisateur a au moins un des rôles requis
    for (const role of requiredRoles) {
      const hasRole = await this.userShopRoleService.hasRole(userId, shopId, role);
      console.log(`[GUARD] hasRole(${userId}, ${shopId}, ${role}) =`, hasRole);
      if (hasRole) {
        return true;
      }
    }

    console.warn('[GUARD] Permissions insuffisantes');
    throw new ForbiddenException('Vous n\'avez pas les permissions nécessaires pour cette action');
  }
} 