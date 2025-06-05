import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from '../users/user-role.enum';

@Controller('admin/orders')
export class OrdersAdminController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(GlobalRole.SUPERADMIN)
  async list() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(GlobalRole.SUPERADMIN)
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
} 