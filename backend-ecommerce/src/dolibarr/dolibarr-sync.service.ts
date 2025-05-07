import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DolibarrService } from './dolibarr.service';
import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from './entities/product.entity';

export interface SyncResult {
  categories: number;
  products: number;
}

@Injectable()
export class DolibarrSyncService {
  constructor(
    private readonly dolibarrService: DolibarrService,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  /**
   * Synchronise les catégories et les produits Dolibarr dans la base locale.
   * 1. Récupère toutes les catégories puis effectue un upsert (insert ou update).
   * 2. Met à jour les relations parent/enfant.
   * 3. Récupère tous les produits puis effectue un upsert.
   * @returns nombre total d'éléments synchronisés
   */
  async sync(categoryId?: string): Promise<SyncResult> {
    let dolibarrProducts: any[] = [];
    let catEntities: CategoryEntity[] = [];
    const productFirstCategory = new Map<string, string>();

    if (categoryId) {
      // Liste de toutes les sous-catégories FC Chalon (ex. 184, 185…)
      let subCategories: any[] = [];
      try {
        subCategories = await this.dolibarrService.getCategoriesFilles(categoryId);
      } catch (err) {
        console.warn('⚠️ Impossible de récupérer les sous-catégories, on continue uniquement avec la catégorie racine');
      }

      const catIds: string[] = [categoryId, ...subCategories.map((c: any) => String(c.id))];

      // Récupérer les produits de chaque catégorie / sous-catégorie
      const productPromises = catIds.map((id) => this.dolibarrService.getProducts(Number(id), 0, true));
      const productsArrays = await Promise.all(productPromises);

      productsArrays.forEach((arr, idx) => {
        const catId = catIds[idx];
        arr.forEach((p: any) => {
          const key = String(p.id);
          if (!productFirstCategory.has(key)) {
            productFirstCategory.set(key, catId);
          }
        });
      });

      dolibarrProducts = productsArrays.flat();

      // Conserver l'unicité des produits (même id pouvant apparaître plusieurs fois)
      const productMap = new Map<string, any>();
      dolibarrProducts.forEach((p) => productMap.set(String(p.id), p));
      dolibarrProducts = Array.from(productMap.values());

      // Construire la liste des catégories rencontrées dans les produits
      const categoryMap = new Map<string, { id: string; label: string }>();
      dolibarrProducts.forEach((p: any) => {
        if (Array.isArray(p.categories)) {
          p.categories.forEach((c: any) => {
            categoryMap.set(String(c.id), { id: String(c.id), label: c.label });
          });
        }
      });

      catEntities = Array.from(categoryMap.values()).map((c) => {
        const entity = new CategoryEntity();
        entity.id = c.id;
        entity.label = c.label;
        return entity;
      });

      // Sauvegarder immédiatement pour que les relations produits puissent se lier
      if (catEntities.length > 0) {
        await this.categoryRepository.save(catEntities);
      }
    } else {
      // --- Étape 1 : catégories (toutes)
      const dolibarrCategories = await this.dolibarrService.getCategories();

      catEntities = dolibarrCategories.map((cat: any) => {
        const entity = new CategoryEntity();
        entity.id = String(cat.id);
        entity.label = cat.label;
        entity.description = cat.description;
        entity.fkParent = cat.fk_parent ? String(cat.fk_parent) : undefined;
        return entity;
      });

      // Upsert des catégories (save gère insert + update)
      await this.categoryRepository.save(catEntities);

      // Mise à jour des relations parent/enfant
      for (const entity of catEntities) {
        if (entity.fkParent) {
          entity.parent = await this.categoryRepository.findOne({ where: { id: entity.fkParent } });
        } else {
          entity.parent = null;
        }
      }
      await this.categoryRepository.save(catEntities);

      // Tous les produits
      dolibarrProducts = await this.dolibarrService.getProducts(undefined, 0, true);
    }

    const prodEntities: ProductEntity[] = [];

    for (const prod of dolibarrProducts) {
      const entity = new ProductEntity();
      entity.id = String(prod.id);
      entity.ref = prod.ref;
      entity.label = prod.label;

      // Les méthodes utilitaires du service ont déjà casté les prix/stock.
      // On garde un fallback en cas d'évolution de l'API.
      const priceHt = typeof prod.price_ht === 'number' ? prod.price_ht : parseFloat(prod.price);
      const priceTtc = typeof prod.price_ttc_number === 'number' ? prod.price_ttc_number : parseFloat(prod.price_ttc);
      const stockVal = typeof prod.stock === 'number' ? prod.stock : parseInt(prod.stock_reel || '0', 10);

      entity.priceHt = Number.isFinite(priceHt) ? priceHt : 0;
      entity.priceTtc = Number.isFinite(priceTtc) ? priceTtc : 0;
      entity.stock = Number.isFinite(stockVal) ? stockVal : 0;

      entity.description = prod.description;

      // Tentative de récupération d'une URL d'image si disponible
      entity.imageUrl = (prod?.image || prod?.imageUrl || prod?.images?.[0]?.url) ?? undefined;

      let mainCatId: string | undefined;
      if (Array.isArray(prod.categories) && prod.categories.length > 0) {
        mainCatId = String(prod.categories[0].id);
      } else {
        mainCatId = productFirstCategory.get(String(prod.id));
      }

      if (mainCatId) {
        entity.category = await this.categoryRepository.findOne({ where: { id: mainCatId } });
      }

      prodEntities.push(entity);
    }

    await this.productRepository.save(prodEntities);

    return {
      categories: catEntities.length,
      products: prodEntities.length,
    };
  }
} 