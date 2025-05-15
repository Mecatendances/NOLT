import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, BadRequestException, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { ShopsService } from './shops.service';
import * as fs from 'fs';

@Controller('dolibarr/products')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {
    // Créer le dossier uploads/products s'il n'existe pas
    const uploadDir = join(process.cwd(), 'uploads', 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: 'uploads/products',
      filename: (_, file, cb) =>
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
    }),
    limits: { fileSize: 5_000_000 }, // 5 Mo
  }))
  async uploadProductImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier');
    const imageUrl = `/uploads/products/${file.filename}`;
    await this.shopsService.updateProductImage(productId, imageUrl);
    return { imageUrl };
  }

  @Patch(':id/web-label')
  async updateProductWebLabel(
    @Param('id') productId: string,
    @Body('webLabel') webLabel: string,
  ) {
    return this.shopsService.updateProductWebLabel(productId, webLabel);
  }
} 