import { Controller, Get, Put, Body, UseGuards, Request, Patch, Param, Post, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from './user-role.enum';

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

  @Get()
  @Roles(GlobalRole.SUPERADMIN)
  async findAll() {
    return this.users.findAll();
  }

  @Patch(':id')
  @Roles(GlobalRole.SUPERADMIN)
  async updateUser(@Param('id') id: string, @Body() body: any) {
    await this.users.updateUser(id, body);
    return { success: true };
  }

  @Post()
  async createOrFindUser(@Body() body: { email: string, name?: string, password?: string, shopId?: string }) {
    return this.users.createOrFindUser(body);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string, password: string }) {
    return this.users.resetPasswordWithToken(body.token, body.password);
  }
} 