import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { ProductEntity } from '../../dolibarr/entities/product.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { OrderEntity } from '../../orders/order.entity';
import { CampaignEntity } from '../../campaigns/campaign.entity';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'integer', name: 'dolibarr_category_id', nullable: true })
  dolibarrCategoryId: number;

  @Column({ nullable: true })
  adminId: string;

  @ManyToMany(() => UserEntity, (user) => user.shops)
  licensees: UserEntity[];

  @OneToMany(() => ProductEntity, product => product.shop)
  products: ProductEntity[];

  @OneToMany(() => OrderEntity, order => order.shop)
  orders: OrderEntity[];

  @OneToMany(() => CampaignEntity, campaign => campaign.shop)
  campaigns: CampaignEntity[];
} 