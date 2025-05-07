import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DolibarrController } from './dolibarr.controller';
import { DolibarrService } from './dolibarr.service';

@Module({
  imports: [
    HttpModule
  ],
  controllers: [DolibarrController],
  providers: [DolibarrService],
  exports: [DolibarrService] // Export du service pour qu'il soit disponible dans d'autres modules
})
export class DolibarrModule {}
