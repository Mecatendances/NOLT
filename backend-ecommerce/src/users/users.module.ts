import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserShopRoleEntity } from './entities/user-shop-role.entity';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity';
import { EmailSettings } from '../mailer/email-settings.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserShopRoleService } from './services/user-shop-role.service';
import { UserShopRoleController, UserShopRoleGlobalController } from './controllers/user-shop-role.controller';
import { AuthModule } from '../auth/auth.module';
import { MailerService } from '../mailer/mailer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserShopRoleEntity, PasswordResetTokenEntity, EmailSettings]),
    forwardRef(() => AuthModule)
  ],
  providers: [UsersService, UserShopRoleService, MailerService],
  controllers: [UsersController, UserShopRoleController, UserShopRoleGlobalController],
  exports: [UsersService, UserShopRoleService, TypeOrmModule],
})
export class UsersModule {} 