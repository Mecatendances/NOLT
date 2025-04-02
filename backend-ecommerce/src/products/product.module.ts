import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { DolibarrService } from '../dolibarr/dolibarr.service';

@Module({
  controllers: [ProductController],
  providers: [DolibarrService],
})
export class ProductModule {}
