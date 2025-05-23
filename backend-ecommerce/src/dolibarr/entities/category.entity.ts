import { Column, Entity, PrimaryColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('categories')
export class CategoryEntity {
  @PrimaryColumn()
  id: string; // On garde l'ID Dolibarr sous forme de string pour être cohérent

  @Column()
  label: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true })
  fkParent?: string;

  @ManyToOne(() => CategoryEntity, (parent) => parent.children, { nullable: true })
  parent?: CategoryEntity;

  @OneToMany(() => CategoryEntity, (child) => child.parent)
  children?: CategoryEntity[];

  @OneToMany(() => ProductEntity, product => product.category)
  products: ProductEntity[];
} 