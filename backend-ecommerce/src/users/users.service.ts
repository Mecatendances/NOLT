import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
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

    const passwordHash = await bcrypt.hash(superAdminPassword, 12);

    const superAdmin = this.userRepository.create({
      name: 'Super Admin',
      email: superAdminEmail,
      passwordHash,
      role: UserRole.SUPERADMIN,
    });
    await this.userRepository.save(superAdmin);
    this.logger.log(`Compte superadmin créé (${superAdminEmail})`);
  }
} 