import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { OrderEntity } from '../orders/order.entity';
import { UserRole } from './user-role.enum';
import { ShopEntity } from '../catalog/shop.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  preferredClub: string;

  @Column({ select: false, nullable: true })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];

  @ManyToMany(() => ShopEntity, (shop) => shop.licensees)
  licenseeShops: ShopEntity[];
} 