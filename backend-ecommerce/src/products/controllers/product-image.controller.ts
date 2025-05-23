import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, Body, UseGuards, Logger, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductImageService } from '../services/product-image.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';

// Créer le dossier uploads/products s'il n'existe pas
const uploadDir = join(process.cwd(), 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const logger = new Logger('ProductImageController');

@Controller('products')
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {
    logger.log(`📁 Dossier d'upload configuré: ${uploadDir}`);
    logger.log(`✅ Le dossier existe: ${fs.existsSync(uploadDir)}`);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        logger.debug(`📁 Destination du fichier: ${uploadDir}`);
        logger.debug(`📄 Informations du fichier:`, file);
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + file.originalname;
        logger.debug(`📝 Nom du fichier généré: ${filename}`);
        cb(null, filename);
      }
    })
  }))
  async uploadImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    logger.debug(`🔐 Utilisateur authentifié:`, req.user);
    logger.debug(`🚀 Début de l'upload pour le produit ${productId}`);
    logger.debug(`📦 Fichier reçu:`, file);
    
    try {
      const result = await this.productImageService.addImage(productId, file);
      logger.debug(`✅ Image uploadée avec succès:`, result);
      return result;
    } catch (error) {
      logger.error(`❌ Erreur lors de l'upload:`, error);
      throw error;
    }
  }

  @Get(':id/images')
  async getProductImages(@Param('id') productId: string) {
    return this.productImageService.getProductImages(productId);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard)
  async deleteImage(@Param('imageId') imageId: number) {
    await this.productImageService.deleteImage(imageId);
    return { success: true };
  }

  @Post(':id/images/reorder')
  @UseGuards(JwtAuthGuard)
  async reorderImages(
    @Param('id') productId: string,
    @Body() body: { imageIds: number[] },
  ) {
    await this.productImageService.reorderImages(productId, body.imageIds);
    return { success: true };
  }

  @Get('test-auth')
  @UseGuards(JwtAuthGuard)
  async testAuth(@Request() req) {
    logger.debug('🔐 Test d\'authentification réussi');
    logger.debug('👤 Utilisateur:', req.user);
    return { 
      message: 'Authentification réussie',
      user: req.user 
    };
  }
} 