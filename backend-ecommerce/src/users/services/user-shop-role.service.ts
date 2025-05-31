import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserShopRoleEntity } from '../entities/user-shop-role.entity';
import { ShopRole } from '../user-role.enum';

@Injectable()
export class UserShopRoleService {
  constructor(
    @InjectRepository(UserShopRoleEntity)
    private userShopRoleRepository: Repository<UserShopRoleEntity>
  ) {}

  async assignRoleToUser(userId: string, shopId: string, role: ShopRole): Promise<UserShopRoleEntity> {
    // Vérifier si un rôle existe déjà pour cet utilisateur dans cette boutique
    const existingRole = await this.userShopRoleRepository.findOne({
      where: { userId, shopId }
    });

    if (existingRole) {
      Logger.log(`Modification du rôle de l'utilisateur ${userId} dans la boutique ${shopId} : ${existingRole.role} -> ${role}`);
      existingRole.role = role;
      return this.userShopRoleRepository.save(existingRole);
    }

    Logger.log(`Attribution du rôle ${role} à l'utilisateur ${userId} dans la boutique ${shopId}`);
    // Créer un nouveau rôle
    const userShopRole = this.userShopRoleRepository.create({
      userId,
      shopId,
      role
    });
    return this.userShopRoleRepository.save(userShopRole);
  }

  async getUserShopRoles(userId: string, shopId?: string): Promise<UserShopRoleEntity[]> {
    const where: any = { userId };
    if (shopId) {
      where.shopId = shopId;
    }
    return this.userShopRoleRepository.find({
      where,
      relations: ['shop']
    });
  }

  async hasRole(userId: string, shopId: string, role: ShopRole): Promise<boolean> {
    const userShopRole = await this.userShopRoleRepository.findOne({
      where: { userId, shopId, role }
    });
    return !!userShopRole;
  }

  async removeRole(userId: string, shopId: string): Promise<void> {
    const result = await this.userShopRoleRepository.delete({ userId, shopId });
    if (result.affected === 0) {
      throw new NotFoundException(`Aucun rôle trouvé pour l'utilisateur ${userId} dans la boutique ${shopId}`);
    }
    Logger.log(`Suppression du rôle de l'utilisateur ${userId} dans la boutique ${shopId}`);
  }

  async getUsersByShopRole(shopId: string, role: ShopRole): Promise<UserShopRoleEntity[]> {
    return this.userShopRoleRepository.find({
      where: { shopId, role },
      relations: ['user']
    });
  }

  async getAllUserShopRoles(): Promise<UserShopRoleEntity[]> {
    return this.userShopRoleRepository.find({ relations: ['user', 'shop'] });
  }

  async getAllUsersForShop(shopId: string): Promise<UserShopRoleEntity[]> {
    return this.userShopRoleRepository.find({
      where: { shopId },
      relations: ['user']
    });
  }
} 