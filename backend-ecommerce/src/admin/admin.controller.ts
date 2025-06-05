import { Controller, Get, UseGuards, Post, Param, Query, UploadedFile, UseInterceptors, BadRequestException, Put, Body } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CampaignsService } from '../campaigns/campaigns.service';
import { ShopsService } from '../shops/shops.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from '../users/user-role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandingSettings } from '../mailer/branding-settings.entity';

@Controller('admin')
@UseGuards(RolesGuard) // 🔒 Protège cette route pour les admins
export class AdminController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly shopsService: ShopsService,
    @InjectRepository(BrandingSettings)
    private readonly brandingSettingsRepository: Repository<BrandingSettings>,
  ) {}

  @Get()
  getAdminData() {
    return { message: 'Données sécurisées pour admin' };
  }

  @Post('branding/upload/:type')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadBrandingImage(
    @Param('type') type: string,
    @Query('shopId') shopId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier uploadé');
    }
    // Vérification du type MIME
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/svg+xml',
      'image/x-icon',
      'image/vnd.microsoft.icon',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      await fs.unlink(file.path); // Nettoyage du fichier temporaire
      throw new BadRequestException('Type de fichier non autorisé');
    }
    // Vérification de la taille (2 Mo max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      await fs.unlink(file.path);
      throw new BadRequestException('Fichier trop volumineux (max 2 Mo)');
    }
    const slug = shopId || 'global';
    const folder = path.join('./uploads', slug);
    const extension = file.originalname.split('.').pop();
    const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    const newFilename = `${type}-${safeSlug}.${extension}`;
    const newPath = path.join(folder, newFilename);

    // Créer le dossier si nécessaire
    await fs.mkdir(folder, { recursive: true });

    // Supprimer l'ancien fichier du même type (s'il existe)
    const oldFiles = await fs.readdir(folder);
    for (const oldFile of oldFiles) {
      if (oldFile.startsWith(`${type}-`)) {
        await fs.unlink(path.join(folder, oldFile));
      }
    }

    // Déplacer le nouveau fichier
    await fs.rename(file.path, newPath);

    return { url: `/uploads/${safeSlug}/${newFilename}` };
  }

  @Put('branding')
  @UseGuards(RolesGuard)
  async updateBrandingSettings(@Body() settings: any, @Query('shopId') shopId: string) {
    // Sécurité stricte : settings sera toujours un objet
    const safeSettings: Partial<BrandingSettings> = Array.isArray(settings) ? settings[0] : settings;

    let brandingEntry = await this.brandingSettingsRepository.findOne({
      where: { shopId: shopId ?? null },
    });

    if (!brandingEntry) {
      brandingEntry = this.brandingSettingsRepository.create({
        ...safeSettings,
        shopId: shopId ?? null,
      });
    } else {
      Object.assign(brandingEntry, safeSettings);
    }

    await this.brandingSettingsRepository.save(brandingEntry);
    return brandingEntry;
  }

  /**
   * Retourne les campagnes groupées par boutique avec stats avancées (superadmin)
   */
  @Get('campaigns/by-shop')
  @Roles(GlobalRole.SUPERADMIN)
  async getCampaignsByShop() {
    return this.campaignsService.findCampaignsByShop();
  }
}
