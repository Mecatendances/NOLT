import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, Index } from 'typeorm';
import { ProductEntity } from './product.entity';
import { CategoryEntity } from './category.entity';

@Entity('product_categories')
export class ProductCategoryEntity {
  @PrimaryColumn({ name: 'product_id', type: 'int' })
  @Index()
  productId: number;

  @PrimaryColumn({ name: 'category_id', type: 'int' })
  @Index()
  categoryId: number;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @ManyToOne(() => CategoryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
} 