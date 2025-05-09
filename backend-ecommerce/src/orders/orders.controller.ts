import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.createOrder(dto);
    return { id: order.id, status: order.status };
  }

  // Endpoint admin – à protéger plus tard
  @Get('admin')
  async list() {
    return this.ordersService.findAll();
  }

  @Get('admin/:id')
  async getOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
} 