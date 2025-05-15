import { Column, Entity, PrimaryColumn, ManyToMany, JoinTable } from 'typeorm';
import { CategoryEntity } from './category.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryColumn()
  id: string; // ID Dolibarr

  @Column()
  ref: string;

  @Column()
  label: string;

  @Column({ type: 'numeric' })
  priceHt: number;

  @Column({ type: 'numeric' })
  priceTtc: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  webLabel?: string; // Nom d'affichage web
  
  @ManyToMany(() => CategoryEntity)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
  })
  categories: CategoryEntity[];
} 