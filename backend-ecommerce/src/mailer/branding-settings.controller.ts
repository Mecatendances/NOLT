import { Controller, Get, Put, Body, UseGuards, Post, Param, Delete, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandingSettings } from './branding-settings.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from '../users/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

function getUploadPath(shopSlug: string | null, filename: string) {
  const folder = shopSlug ? `uploads/${shopSlug}` : 'uploads/global';
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  return path.join(folder, filename);
}

@UseGuards(JwtAuthGuard)
@Controller('admin/branding')
export class BrandingSettingsController {
  constructor(
    @InjectRepository(BrandingSettings)
    private readonly brandingSettingsRepository: Repository<BrandingSettings>,
  ) {}

  @Get()
  @Roles(GlobalRole.SUPERADMIN)
  async getAll(@Query('shopId') shopId?: string) {
    if (shopId) {
      return this.brandingSettingsRepository.find({ where: { shopId } });
    }
    return this.brandingSettingsRepository.find({ where: { shopId: null } });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.brandingSettingsRepository.findOne({ where: { id } });
  }

  @Post()
  @Roles(GlobalRole.SUPERADMIN)
  async create(@Body() body: Partial<BrandingSettings>) {
    const branding = this.brandingSettingsRepository.create(body);
    return this.brandingSettingsRepository.save(branding);
  }

  @Put(':id')
  @Roles(GlobalRole.SUPERADMIN)
  async update(@Param('id') id: string, @Body() body: Partial<BrandingSettings>) {
    await this.brandingSettingsRepository.update(id, body);
    return this.brandingSettingsRepository.findOne({ where: { id } });
  }

  @Delete(':id')
  @Roles(GlobalRole.SUPERADMIN)
  async remove(@Param('id') id: string) {
    await this.brandingSettingsRepository.delete(id);
    return { success: true };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const shopSlug = req.body.shopSlug || 'global';
        const folder = path.join('uploads', shopSlug);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      }
    })
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { url: `/${file.path.replace(/\\/g, '/')}` };
  }
} 