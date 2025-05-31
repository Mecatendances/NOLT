import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Shop } from '../../shops/entities/shop.entity';
import { OrderEntity } from '../../orders/order.entity';
import { GlobalRole } from '../user-role.enum';
import { UserShopRoleEntity } from './user-shop-role.entity';
import { PasswordResetTokenEntity } from './password-reset-token.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: GlobalRole,
    default: GlobalRole.CLIENT
  })
  role: GlobalRole;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'uuid', name: 'shop_id', nullable: true })
  shopId: string;

  @ManyToOne(() => Shop, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'shop_id' })
  directShop: Shop;

  @ManyToMany(() => Shop)
  @JoinTable({
    name: 'user_shops',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'shop_id', referencedColumnName: 'id' },
  })
  shops: Shop[];

  @OneToMany(() => OrderEntity, order => order.user)
  orders: OrderEntity[];

  @OneToMany(() => UserShopRoleEntity, userShopRole => userShopRole.user)
  shopRoles: UserShopRoleEntity[];

  @OneToMany(() => PasswordResetTokenEntity, token => token.user)
  passwordResetTokens: PasswordResetTokenEntity[];

  // Alias pour la relation ManyToMany avec les boutiques
  get licenseeShops(): Shop[] {
    return this.shops;
  }
} 