import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { UserEntity } from '../users/user.entity';
import { CampaignEntity } from '../campaigns/campaign.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.orders, { eager: true, cascade: ['insert'] })
  user: UserEntity;

  @ManyToOne(() => CampaignEntity, (campaign) => campaign.orders, { nullable: true, onDelete: 'SET NULL' })
  campaign?: CampaignEntity;

  @Column({ type: 'numeric' })
  totalTtc: number;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'PAID' | 'SENT' | 'CANCELLED';

  @Column({ nullable: true })
  dolibarrId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItemEntity, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItemEntity[];
} 