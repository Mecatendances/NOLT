import { Entity, Column, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductCategoryEntity } from './product-category.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => CategoryEntity, category => category.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fk_parent' })
  parent: CategoryEntity;

  @OneToMany(() => CategoryEntity, category => category.parent)
  children: CategoryEntity[];

  @OneToMany(() => ProductCategoryEntity, productCategory => productCategory.category)
  products: ProductCategoryEntity[];
} 