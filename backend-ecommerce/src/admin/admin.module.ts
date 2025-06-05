import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ShopsModule } from '../shops/shops.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandingSettings } from '../mailer/branding-settings.entity';

@Module({
  imports: [ShopsModule, CampaignsModule, TypeOrmModule.forFeature([BrandingSettings])],
  controllers: [AdminController],
})
export class AdminModule {}
