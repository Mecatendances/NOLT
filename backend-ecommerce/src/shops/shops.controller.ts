import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, BadRequestException, Patch, Put, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { ShopsService } from './shops.service';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShopAdminGuard } from '../auth/shop-admin.guard';
import { UpdateShopBrandingDto } from '../shops/dto/update-shop-branding.dto';
import { Request } from 'express';

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
    return this.shopsService.addProductImage(productId, file);
  }

  @Patch(':id/web-label')
  async updateProductWebLabel(
    @Param('id') productId: string,
    @Body('webLabel') webLabel: string,
  ) {
    return this.shopsService.updateProductWebLabel(productId, webLabel);
  }

  @Get('branding')
  @UseGuards(JwtAuthGuard, ShopAdminGuard)
  async getBrandingSettings(@Req() req: Request) {
    const shopId = req.user.shopId;
    return this.shopsService.getBrandingSettings(shopId);
  }

  @Put('branding')
  @UseGuards(JwtAuthGuard, ShopAdminGuard)
  async updateBrandingSettings(
    @Req() req: Request,
    @Body() settings: UpdateShopBrandingDto
  ) {
    const shopId = req.user.shopId;
    return this.shopsService.updateBrandingSettings(shopId, settings);
  }

  @Post('branding/upload/:type')
  @UseGuards(JwtAuthGuard, ShopAdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const shopId = req.user.shopId;
          const type = req.params.type;
          const ext = file.originalname.split('.').pop();
          cb(null, `${type}-${shopId}.${ext}`);
        },
      }),
    }),
  )
  async uploadBrandingImage(
    @Req() req: Request,
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const shopId = req.user.shopId;
    return this.shopsService.uploadBrandingImage(shopId, type, file);
  }
} 