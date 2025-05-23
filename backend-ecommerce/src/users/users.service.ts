import { Injectable, Logger, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRole } from './user-role.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
      role: UserRole.SUPERADMIN,
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
} 