import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { AddOrdersDto } from './dto/add-orders.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  @Get()
  list() {
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
} 