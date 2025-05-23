import { Column, Entity, PrimaryColumn, ManyToMany, JoinTable, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { ProductImage } from '../../products/entities/product-image.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { ShopProductMetadataEntity } from '../../shop-product-metadata/entities/shop-product-metadata.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryColumn('integer')
  id: number; // ID Dolibarr (ou local)

  @Column({ nullable: true })
  ref: string;

  @Column()
  label: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0.00, name: 'price_ht' })
  priceHt: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0.00, name: 'price_ttc' })
  priceTtc: number;

  @Column({ type: 'integer', default: 0 })
  stock: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true, name: 'web_label' })
  webLabel?: string;
  
  @OneToMany(() => ProductImage, image => image.product, { cascade: true })
  images: ProductImage[];

  @Column({ name: 'category_id', type: 'integer', nullable: true })
  categoryId: number;

  @ManyToOne(() => CategoryEntity, category => category.products, {nullable: true, onDelete: 'SET NULL'})
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
  
  @Column({ type: 'uuid', name: 'shop_id' })
  shopId: string;

  @ManyToOne(() => Shop, shop => shop.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @OneToMany(() => ShopProductMetadataEntity, metadata => metadata.product)
  metadataEntries: ShopProductMetadataEntity[];
} 