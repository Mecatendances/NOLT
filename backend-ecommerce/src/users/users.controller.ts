import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@Request() req) {
    const user = await this.users.findById(req.user.sub);
    delete (user as any).passwordHash;
    return user;
  }

  @Put('me')
  async updateMe(@Request() req, @Body() body: any) {
    await this.users.updateUser(req.user.sub, body);
    return { success: true };
  }
} 