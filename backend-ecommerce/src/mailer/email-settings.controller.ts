import { Controller, Get, Put, Body, UseGuards, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailSettings } from './email-settings.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from '../users/user-role.enum';

@UseGuards(JwtAuthGuard)
@Controller('admin/email-settings')
export class EmailSettingsController {
  constructor(
    @InjectRepository(EmailSettings)
    private readonly emailSettingsRepository: Repository<EmailSettings>,
  ) {}

  @Get()
  @Roles(GlobalRole.SUPERADMIN)
  async getSettings() {
    return this.emailSettingsRepository.findOne({});
  }

  @Put()
  @Roles(GlobalRole.SUPERADMIN)
  async updateSettings(@Body() body: Partial<EmailSettings>) {
    let settings = await this.emailSettingsRepository.findOne({});
    if (!settings) {
      settings = this.emailSettingsRepository.create(body);
    } else {
      Object.assign(settings, body);
    }
    return this.emailSettingsRepository.save(settings);
  }

  @Post()
  @Roles(GlobalRole.SUPERADMIN)
  async createSettings(@Body() body: Partial<EmailSettings>) {
    const settings = this.emailSettingsRepository.create(body);
    return this.emailSettingsRepository.save(settings);
  }
} 