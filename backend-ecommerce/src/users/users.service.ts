import { Injectable, Logger, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { GlobalRole, ShopRole } from './user-role.enum';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity';
import { MailerService } from '../mailer/mailer.service';
import { UserShopRoleEntity } from './entities/user-shop-role.entity';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PasswordResetTokenEntity)
    private readonly passwordResetTokenRepository: Repository<PasswordResetTokenEntity>,
    @InjectRepository(UserShopRoleEntity)
    private readonly userShopRoleRepository: Repository<UserShopRoleEntity>,
    private readonly mailerService: MailerService,
  ) {}

  async onApplicationBootstrap() {
    const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@nolt.com';
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'password123';

    const existing = await this.userRepository.findOne({ where: { email: superAdminEmail } });
    if (existing) {
      this.logger.log('Superadmin déjà existant');
      return;
    }

    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

    const superAdmin = this.userRepository.create({
      email: superAdminEmail,
      password: hashedPassword,
      role: GlobalRole.SUPERADMIN,
    });
    await this.userRepository.save(superAdmin);
    this.logger.log(`Compte superadmin créé (${superAdminEmail})`);
  }

  async validateCredentials(email: string, plainPassword: string) {
    const user = await this.userRepository.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(plainPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    delete (user as any).password;
    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUser(id: string, patch: Partial<UserEntity>) {
    const { email, role, shopId } = patch;
    const validPatch: Partial<UserEntity> = {};
    if (email !== undefined) validPatch.email = email;
    if (role !== undefined) validPatch.role = role;
    if (shopId !== undefined) validPatch.shopId = shopId;

    if (Object.keys(validPatch).length > 0) {
        await this.userRepository.update({ id }, validPatch);
    }
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createOrFindUser(data: { email: string, name?: string, password?: string, shopId?: string }) {
    let user = await this.findByEmail(data.email);
    if (!user) {
      const password = data.password || Math.random().toString(36).slice(-10);
      user = this.userRepository.create({ email: data.email, name: data.name, password });
      user = await this.userRepository.save(user);
    }
    // Ajout automatique à la boutique si shopId présent
    if (data.shopId) {
      const exists = await this.userShopRoleRepository.findOne({ where: { userId: user.id, shopId: data.shopId } });
      if (!exists) {
        await this.userShopRoleRepository.save({
          userId: user.id,
          shopId: data.shopId,
          role: ShopRole.SHOP_CLIENT,
        });
      }
    }
    return user;
  }

  async createUser(data: { email: string, name?: string }): Promise<UserEntity> {
    // Génère un mot de passe temporaire aléatoire
    const password = Math.random().toString(36).slice(-10);
    const user = this.userRepository.create({ ...data, password });
    const savedUser = await this.userRepository.save(user);

    // Génère un token de reset
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h
    const resetToken = new PasswordResetTokenEntity();
    resetToken.token = token;
    resetToken.expiresAt = expiresAt;
    resetToken.user = savedUser;
    await this.passwordResetTokenRepository.save(resetToken);

    // TODO: Envoyer un email à l'utilisateur avec le lien de reset
    const resetLink = `https://ton-frontend.com/reset-password?token=${token}`;
    await this.mailerService.sendPasswordResetEmail(savedUser.email, resetLink);

    return savedUser;
  }

  async resetPasswordWithToken(token: string, newPassword: string) {
    // 1. Chercher le token
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token },
      relations: ['user']
    });
    if (!resetToken || resetToken.used) {
      throw new UnauthorizedException('Token invalide ou déjà utilisé.');
    }
    if (resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token expiré.');
    }
    // 2. Mettre à jour le mot de passe de l'utilisateur
    const hashed = await bcrypt.hash(newPassword, 12);
    resetToken.user.password = hashed;
    await this.userRepository.save(resetToken.user);
    // 3. Marquer le token comme utilisé
    resetToken.used = true;
    await this.passwordResetTokenRepository.save(resetToken);
    return { success: true };
  }
} 