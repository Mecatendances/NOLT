import { Module } from '@nestjs/common';
import { DolibarrService } from './dolibarr.service';
import { DolibarrController } from './dolibarr.controller';

@Module({
  controllers: [DolibarrController],
  providers: [DolibarrService],
  exports: [DolibarrService] // Permet d’utiliser le service dans d’autres modules
})
export class DolibarrModule {}
