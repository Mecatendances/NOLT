import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService, private readonly jwt: JwtService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto, @Request() req) {
    let userId: string | undefined;
    const auth = req.headers['authorization'] as string | undefined;
    if (auth?.startsWith('Bearer ')) {
      try {
        const payload: any = this.jwt.verify(auth.split(' ')[1], { secret: process.env.JWT_SECRET || 'superSecret' });
        userId = payload.sub;
      } catch {}
    }

    const order = await this.ordersService.createOrder(dto, userId);
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

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async myOrders(@Request() req) {
    return this.ordersService.findByUser(req.user.sub);
  }
} 