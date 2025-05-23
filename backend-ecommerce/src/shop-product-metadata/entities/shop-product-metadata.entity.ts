import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn,
  Index
} from 'typeorm';
import { Shop } from '../../shops/entities/shop.entity'; // Chemin corrigé, était ../../catalog/shop.entity
import { ProductEntity } from '../../dolibarr/entities/product.entity'; // AJOUT

@Entity('shop_product_metadata')
@Index(['shopId', 'productId'], { unique: true }) // Assure une seule entrée par shop/produit
export class ShopProductMetadataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopId: string;

  @Column({ type: 'integer', name: 'product_id' }) // Changer en integer si ProductEntity.id est number
  productId: number;

  @ManyToOne(() => ProductEntity, product => product.metadataEntries, { onDelete: 'CASCADE'}) // AJOUT RELATION
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ name: 'custom_weblabel', length: 255, nullable: true }) // Nom de colonne BDD explicite
  customWebLabel?: string;

  // Potentiellement d'autres champs spécifiques au shop pour ce produit ici
  // Par exemple: 
  // @Column({ type: 'text', nullable: true })
  // customDescription?: string;
  // 
  // @OneToMany(() => ShopProductImageEntity, image => image.shopProductMetadata, { cascade: true })
  // customImages: ShopProductImageEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relation avec ShopEntity
  @ManyToOne(() => Shop, {
    onDelete: 'CASCADE', // Si la boutique est supprimée, supprimer ces métadonnées
    nullable: false
  })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  // Note: Il n'y a pas de relation @ManyToOne vers ProductEntity (de Dolibarr)
  // car ProductEntity n'est pas forcément gérée comme une entité ORM complète
  // avec des relations bidirectionnelles dans ce contexte. productId est un simple ID.
} 