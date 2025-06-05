import {
  Controller, Post, Param, UploadedFile, UseInterceptors, BadRequestException, UseGuards, Put, Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ShopRolesGuard } from '../auth/shop-roles.guard';
import { ShopRoles } from '../auth/decorators/shop-roles.decorator';
import { ShopRole } from '../users/user-role.enum';

@Controller('shops/:shopId/admin/branding')
@UseGuards(ShopRolesGuard)
export class ShopAdminBrandingController {
  @Post('upload/:type')
  @ShopRoles(ShopRole.SHOP_ADMIN)
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async uploadBrandingImage(
    @Param('type') type: string,
    @Param('shopId') shopId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException('Aucun fichier uploadé');
    const allowedMimeTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      await fs.unlink(file.path);
      throw new BadRequestException('Type de fichier non autorisé');
    }
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      await fs.unlink(file.path);
      throw new BadRequestException('Fichier trop volumineux (max 2 Mo)');
    }
    const slug = shopId;
    const folder = path.join('./uploads', slug);
    const extension = file.originalname.split('.').pop();
    const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    const newFilename = `${type}-${safeSlug}.${extension}`;
    const newPath = path.join(folder, newFilename);

    await fs.mkdir(folder, { recursive: true });
    const oldFiles = await fs.readdir(folder);
    for (const oldFile of oldFiles) {
      if (oldFile.startsWith(`${type}-`)) {
        await fs.unlink(path.join(folder, oldFile));
      }
    }
    await fs.rename(file.path, newPath);

    return { url: `/uploads/${safeSlug}/${newFilename}` };
  }

  @Put()
  @ShopRoles(ShopRole.SHOP_ADMIN)
  async updateBrandingSettings(@Body() settings: any, @Param('shopId') shopId: string) {
    // Ici, tu ajoutes la logique pour sauvegarder les paramètres de branding de la boutique
    return { success: true };
  }
} 