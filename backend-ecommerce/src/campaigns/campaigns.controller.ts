import { Controller, Post, Body, Get, Param, Delete, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { AddOrdersDto } from './dto/add-orders.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  async create(@Body() dto: CreateCampaignDto) {
    console.log('Création de campagne - DTO reçu:', dto);
    try {
      const campaign = await this.campaignsService.create(dto);
      console.log('Campagne créée avec succès:', campaign);
      return campaign;
    } catch (error) {
      console.error('Erreur lors de la création de la campagne:', error);
      throw error;
    }
  }

  @Get()
  list(@Query('shopId') shopId?: string) {
    if (shopId) {
      return this.campaignsService.findByShop(shopId);
    }
    return this.campaignsService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Post(':id/add-orders')
  addOrders(@Param('id') id: string, @Body() dto: AddOrdersDto) {
    return this.campaignsService.addOrders(id, dto);
  }

  @Post(':id/remove-order/:orderId')
  removeOrder(@Param('id') id: string, @Param('orderId') orderId: string) {
    return this.campaignsService.removeOrder(id, orderId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    console.log('Suppression de la campagne:', id);
    try {
      await this.campaignsService.remove(id);
      return { message: 'Campagne supprimée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression de la campagne:', error);
      throw error;
    }
  }
} 