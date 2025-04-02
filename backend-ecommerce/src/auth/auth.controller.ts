import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api')
export class AuthController {
  @UseGuards(JwtAuthGuard)
  @Get('protected-route')
  getProtectedRoute(@Request() req) {
    return {
      message: 'Access granted',
      user: req.user,
    };
  }
}
