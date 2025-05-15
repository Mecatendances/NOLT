import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './order.entity';
import { OrderItemEntity } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductEntity } from '../dolibarr/entities/product.entity';
import { UserEntity } from '../users/user.entity';

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
      const product = await this.productRepository.findOne({ where: { id: String(i.productId) } });
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
          name: dto.customerName,
          email: dto.customerEmail,
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
    });

    return this.orderRepository.save(order);
  }

  async findAll(): Promise<OrderEntity[]> {
    return this.orderRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<OrderEntity | null> {
    return this.orderRepository.findOne({ where: { id } });
  }

  async findByUser(userId: string): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: {
        user: { id: userId } as any,
      },
      order: { createdAt: 'DESC' },
    });
  }
} 