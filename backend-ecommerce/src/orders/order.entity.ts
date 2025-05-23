import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CampaignEntity } from '../campaigns/campaign.entity';
import { Shop } from '../shops/entities/shop.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.orders, { eager: true, cascade: ['insert'] })
  user: UserEntity;

  @ManyToOne(() => CampaignEntity, (campaign) => campaign.orders, { nullable: true, onDelete: 'SET NULL' })
  campaign?: CampaignEntity;

  @Column({ type: 'uuid', name: 'shop_id' })
  shopId: string;

  @ManyToOne(() => Shop, shop => shop.orders)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ type: 'numeric' })
  totalTtc: number;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'PAID' | 'SENT' | 'CANCELLED';

  @Column({ nullable: true })
  dolibarrId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => OrderItemEntity, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItemEntity[];
} 