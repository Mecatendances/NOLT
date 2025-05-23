import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { ProductEntity } from '../../dolibarr/entities/product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  alt: string;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => ProductEntity, product => product.images)
  product: ProductEntity;

  @CreateDateColumn()
  createdAt: Date;
} 