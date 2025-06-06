import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatus } from './order.entity';
import { OrderItemEntity } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductEntity } from '../catalog/entities/product.entity';
import { UserEntity } from '../users/entities/user.entity';
import { GlobalRole } from '../users/user-role.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createOrder(dto: CreateOrderDto, userId?: string): Promise<OrderEntity> {
    // Vérifier / charger les produits
    const items: OrderItemEntity[] = [];
    let total = 0;

    for (const i of dto.items) {
      const product = await this.productRepository.findOne({ where: { id: Number(i.productId) } });
      if (!product) throw new Error(`Produit ${i.productId} introuvable`);

      const item = new OrderItemEntity();
      item.product = product;
      item.quantity = i.quantity;
      item.size = i.size || '-';
      item.unitPriceTtc = product.priceTtc;
      total += product.priceTtc * i.quantity;
      items.push(item);
    }

    // Déterminer l'utilisateur associé
    let user: UserEntity | null = null;
    if (userId) {
      user = await this.userRepository.findOne({ where: { id: userId } });
    }

    if (!user) {
      // Fallback à l'ancienne logique via email dans le DTO
      user = await this.userRepository.findOne({ where: { email: dto.customerEmail } });
      if (!user) {
        user = this.userRepository.create({
          email: dto.customerEmail,
          password: 'tempPassword@123',
          role: GlobalRole.CLIENT,
          phone: dto.customerPhone,
          address: dto.address,
          zipCode: dto.zipCode,
          city: dto.city,
        });
        await this.userRepository.save(user);
      }
    }

    const order = this.orderRepository.create({
      user,
      totalTtc: total,
      items,
      shopId: dto.shopId,
    });

    return this.orderRepository.save(order);
  }

  async findAll(): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user', 'items', 'shop'],
    });
  }

  async findOne(id: string): Promise<OrderEntity | null> {
    console.log('Service - Recherche de la commande:', id);
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'items.product.images', 'shop', 'campaign'],
      select: {
        id: true,
        totalTtc: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shopId: true,
        user: {
          id: true,
          email: true,
          phone: true,
          address: true,
          zipCode: true,
          city: true
        },
        items: {
          id: true,
          quantity: true,
          size: true,
          unitPriceTtc: true,
          product: {
            id: true,
            label: true,
            images: {
              id: true,
              url: true,
              order: true
            }
          }
        },
        shop: {
          id: true,
          name: true
        },
        campaign: {
          id: true,
          name: true
        }
      }
    });
    console.log('Service - Commande trouvée:', order);
    return order;
  }

  async findByUser(userId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: {
        user: { id: userId } as any,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findByShop(shopId: string): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.find({
      where: { shop: { id: shopId } },
      order: { createdAt: 'DESC' },
      relations: ['user', 'items', 'shop', 'campaign'],
    });
    console.log('[findByShop] Orders retournés:', orders.map(o => ({ id: o.id, shopId: o.shopId, createdAt: o.createdAt })));
    // On retourne directement les entités, le champ id est bien celui de la commande
    return orders;
  }

  async assignCampaign(orderId: string, campaignId: string | null): Promise<OrderEntity | null> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) return null;
    if (campaignId) {
      order.campaign = { id: campaignId } as any;
    } else {
      order.campaign = null;
    }
    await this.orderRepository.save(order);
    // Recharge la commande avec la relation campaign pour le retour API
    return this.orderRepository.findOne({ where: { id: orderId }, relations: ['campaign'] });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderEntity | null> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) return null;
    order.status = status;
    return this.orderRepository.save(order);
  }
} 