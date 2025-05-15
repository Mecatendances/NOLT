import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.usersService.validateCredentials(body.email, body.password);

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      licenseeShops: user.licenseeShops?.map(s => s.id),
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  testProtected(@Request() req) {
    return { message: 'OK', user: req.user };
  }
}
