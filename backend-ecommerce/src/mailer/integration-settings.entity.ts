import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity';

@Entity('integration_settings')
export class IntegrationSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() provider: string; // ex: 'stripe', 'google-analytics', 'facebook', 'whatsapp', etc.

  @Column({ type: 'uuid', name: 'shop_id', nullable: true })
  shopId: string | null;

  @ManyToOne(() => Shop, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  // Champs génériques
  @Column({ nullable: true }) apiKey: string;
  @Column({ nullable: true }) clientId: string;
  @Column({ nullable: true }) clientSecret: string;
  @Column({ nullable: true }) webhookSecret: string;
  @Column({ nullable: true }) trackingId: string;
  @Column({ nullable: true }) pageId: string; // Pour Facebook/Meta
  @Column({ nullable: true }) phoneNumber: string; // Pour WhatsApp
  @Column({ nullable: true }) accessToken: string; // Pour réseaux sociaux/WhatsApp
  @Column({ nullable: true }) extra: string; // JSON pour les configs spécifiques
} 