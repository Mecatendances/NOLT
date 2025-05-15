import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity('shops')
export class ShopEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string; // sous-domaine

  @Column({ type: 'int', nullable: true })
  dolibarrCategoryId: number;

  @ManyToMany(() => UserEntity, (u) => u.licenseeShops)
  licensees: UserEntity[];

  @Column({ nullable: true })
  adminId: string; // FK vers User admin (simple UUID pour l'instant)
} 