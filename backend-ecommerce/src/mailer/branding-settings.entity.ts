import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity';

@Entity('branding_settings')
export class BrandingSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  shopId: string | null;

  @ManyToOne(() => Shop, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ nullable: true }) logoUrl: string;
  @Column({ nullable: true }) faviconUrl: string;
  @Column({ nullable: true }) mainColor: string;
  @Column({ nullable: true }) name: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) coverImageUrl: string;
  @Column({ nullable: true }) footerText: string;
  @Column({ nullable: true }) contactEmail: string;
  @Column({ nullable: true }) facebookUrl: string;
  @Column({ nullable: true }) instagramUrl: string;
  // Champs pour la landing publique
  @Column({ nullable: true }) landingTitle: string;
  @Column({ nullable: true }) landingSlogan: string;
  @Column({ nullable: true }) landingCoverImage: string;
  @Column({ nullable: true }) primaryColor: string;
  @Column({ nullable: true }) secondaryColor: string;
  // Champs optionnels pour le dashboard admin
  @Column({ nullable: true }) dashboardTitle: string;
  @Column({ nullable: true }) dashboardSlogan: string;
  @Column({ nullable: true }) dashboardCoverImage: string;
  // Ajoute d'autres champs si besoin
} 