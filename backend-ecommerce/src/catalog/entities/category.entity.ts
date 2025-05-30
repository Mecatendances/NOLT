import { Entity, Column, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ProductCategoryEntity } from './product-category.entity';
import { Shop } from '../../shops/entities/shop.entity';

@Entity('categories')
@Unique(['shopId', 'label'])
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'shop_id' })
  shopId: string;

  @Column({ name: 'dolibarr_id', nullable: false })
  dolibarrId: number;

  @ManyToOne(() => CategoryEntity, category => category.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fk_parent' })
  parent: CategoryEntity;

  @OneToMany(() => CategoryEntity, category => category.parent)
  children: CategoryEntity[];

  @OneToMany(() => ProductCategoryEntity, productCategory => productCategory.category)
  products: ProductCategoryEntity[];

  @ManyToOne(() => Shop, shop => shop.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ name: 'fk_parent', nullable: true })
  fkParent: number;
} 