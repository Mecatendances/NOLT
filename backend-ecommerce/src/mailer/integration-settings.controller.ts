import { Controller, Get, Put, Body, UseGuards, Post, Param, Delete, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationSettings } from './integration-settings.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from '../users/user-role.enum';

@UseGuards(JwtAuthGuard)
@Controller('admin/integrations')
export class IntegrationSettingsController {
  constructor(
    @InjectRepository(IntegrationSettings)
    private readonly integrationSettingsRepository: Repository<IntegrationSettings>,
  ) {}

  @Get()
  @Roles(GlobalRole.SUPERADMIN)
  async getAll(@Query('shopId') shopId?: string) {
    if (shopId) {
      return this.integrationSettingsRepository.find({ where: { shopId } });
    }
    return this.integrationSettingsRepository.find({ where: { shopId: null } });
  }

  @Get(':id')
  @Roles(GlobalRole.SUPERADMIN)
  async getOne(@Param('id') id: string) {
    return this.integrationSettingsRepository.findOne({ where: { id } });
  }

  @Post()
  @Roles(GlobalRole.SUPERADMIN)
  async create(@Body() body: Partial<IntegrationSettings>) {
    const integration = this.integrationSettingsRepository.create(body);
    return this.integrationSettingsRepository.save(integration);
  }

  @Put(':id')
  @Roles(GlobalRole.SUPERADMIN)
  async update(@Param('id') id: string, @Body() body: Partial<IntegrationSettings>) {
    await this.integrationSettingsRepository.update(id, body);
    return this.integrationSettingsRepository.findOne({ where: { id } });
  }

  @Delete(':id')
  @Roles(GlobalRole.SUPERADMIN)
  async remove(@Param('id') id: string) {
    await this.integrationSettingsRepository.delete(id);
    return { success: true };
  }
} 