import { Entity, Column, OneToMany, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductCategoryEntity } from './product-category.entity';
import { ProductImage } from '../../products/entities/product-image.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { ShopProductMetadataEntity } from '../../shop-product-metadata/entities/shop-product-metadata.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  label: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'price_ttc', type: 'decimal', precision: 10, scale: 2 })
  priceTtc: number;

  @Column({ name: 'price_ht', type: 'decimal', precision: 10, scale: 2 })
  priceHt: number;

  @Column({ name: 'tva_tx', type: 'decimal', precision: 5, scale: 2 })
  tvaTx: number;

  @Column({ name: 'stock_reel', type: 'int', nullable: true })
  stockReel: number;

  @Column({ name: 'stock_virtuel', type: 'int', nullable: true })
  stockVirtuel: number;

  @Column({ name: 'status', type: 'int', nullable: true })
  status: number;

  @Column({ name: 'ref', nullable: true })
  ref: string;

  @Column({ name: 'barcode', nullable: true })
  barcode: string;

  @Column({ name: 'fk_product_type', type: 'int', nullable: true })
  fkProductType: number;

  @Column({ name: 'datec', type: 'timestamp', nullable: true })
  datec: Date;

  @Column({ name: 'tms', type: 'timestamp', nullable: true })
  tms: Date;

  @Column({ name: 'import_key', nullable: true })
  importKey: string;

  @Column({ name: 'url', nullable: true })
  url: string;

  @Column({ name: 'duration', nullable: true })
  duration: string;

  @Column({ name: 'fk_user_author', type: 'int', nullable: true })
  fkUserAuthor: number;

  @Column({ name: 'fk_user_modif', type: 'int', nullable: true })
  fkUserModif: number;

  @Column({ name: 'fk_user_cloture', type: 'int', nullable: true })
  fkUserCloture: number;

  @Column({ name: 'date_cloture', type: 'timestamp', nullable: true })
  dateCloture: Date;

  @Column({ name: 'note_private', nullable: true })
  notePrivate: string;

  @Column({ name: 'note_public', nullable: true })
  notePublic: string;

  @Column({ name: 'model_pdf', nullable: true })
  modelPdf: string;

  @Column({ name: 'last_main_doc', nullable: true })
  lastMainDoc: string;

  @Column({ name: 'fk_barcode_type', type: 'int', nullable: true })
  fkBarcodeType: number;

  @Column({ name: 'seuil_stock_alerte', type: 'int', nullable: true })
  seuilStockAlerte: number;

  @Column({ name: 'desiredstock', type: 'int', nullable: true })
  desiredstock: number;

  @Column({ name: 'customcode', nullable: true })
  customcode: string;

  @Column({ name: 'fk_unit', type: 'int', nullable: true })
  fkUnit: number;

  @Column({ name: 'websites', nullable: true })
  websites: string;

  @Column({ name: 'fk_warehouse', type: 'int', nullable: true })
  fkWarehouse: number;

  @Column({ name: 'fk_company', type: 'int', nullable: true })
  fkCompany: number;

  @Column({ name: 'fk_project', type: 'int', nullable: true })
  fkProject: number;

  @Column({ name: 'fk_thirdparty', type: 'int', nullable: true })
  fkThirdparty: number;

  @Column({ name: 'fk_account', type: 'int', nullable: true })
  fkAccount: number;

  @Column({ name: 'fk_bank', type: 'int', nullable: true })
  fkBank: number;

  // Champs fusionnés pour compatibilité backend
  @Column({ name: 'web_label', nullable: true })
  webLabel?: string;

  @Column({ type: 'integer', nullable: true })
  stock?: number;

  @Column({ name: 'category_id', type: 'integer', nullable: true })
  categoryId?: number;

  @Column({ type: 'uuid', name: 'shop_id', nullable: true })
  shopId?: string;

  @ManyToOne(() => Shop, shop => shop.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @OneToMany(() => ProductImage, image => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => ShopProductMetadataEntity, metadata => metadata.product)
  metadataEntries: ShopProductMetadataEntity[];

  @OneToMany(() => ProductCategoryEntity, productCategory => productCategory.product)
  categories: ProductCategoryEntity[];
} 