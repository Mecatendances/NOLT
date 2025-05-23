import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  findAll() {
    // Retourner la liste des produits (à implémenter)
    return [];
  }

  findOne(id: string) {
    // Retourner un produit par son id (à implémenter)
    return { id };
  }

  create(createProductDto: any) {
    // Créer un produit (à implémenter)
    return createProductDto;
  }
} 