import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from '../orders/order.entity';
import { Shop } from '../shops/entities/shop.entity';

export type CampaignStatus = 'DRAFT' | 'PAID' | 'SENT';

@Entity('campaigns')
export class CampaignEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 'DRAFT' })
  status: CampaignStatus;

  // Valeur calculée mais on la stocke pour des raisons de reporting
  @Column({ type: 'numeric', default: 0 })
  totalTtc: number;

  @Column({ type: 'uuid', name: 'shop_id' })
  shopId: string;

  @ManyToOne(() => Shop, shop => shop.campaigns)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderEntity, (order) => order.campaign)
  orders: OrderEntity[];
} 