import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderEntity } from '../orders/order.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderEntity, (order) => order.campaign)
  orders: OrderEntity[];
} 