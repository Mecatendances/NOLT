import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';

@Controller('admin')
@UseGuards(RolesGuard) // 🔒 Protège cette route pour les admins
export class AdminController {
  @Get()
  getAdminData() {
    return { message: 'Données sécurisées pour admin' };
  }
}
