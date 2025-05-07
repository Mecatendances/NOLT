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
    try {
      let dolibarrProducts: any[] = [];
      let catEntities: CategoryEntity[] = [];
      const productFirstCategory = new Map<string, string>();

      if (categoryId) {
        // --- Approche simplifiée pour FC Chalon ---
        console.log(`🔄 Synchronisation catégorie ${categoryId} et ses sous-catégories`);
        
        try {
          // 1. Récupérer toutes les sous-catégories via noltapi (fonctionne bien)
          const categoriesFilles = await this.dolibarrService.getCategoriesFilles(categoryId);
          console.log('categoriesFilles reçu:', typeof categoriesFilles, 
            Array.isArray(categoriesFilles) ? categoriesFilles.length : 'non-array');
          
          let subCategories: any[] = [];
          
          // Normaliser la réponse en tableau
          if (Array.isArray(categoriesFilles)) {
            subCategories = categoriesFilles;
          } else if (categoriesFilles && typeof categoriesFilles === 'object') {
            console.log('Conversion objet → tableau', Object.keys(categoriesFilles).length);
            subCategories = Object.values(categoriesFilles);
          }
          
          console.log(`✅ ${subCategories.length} sous-catégories récupérées`);

          // 2. Ajouter la catégorie parente à la liste
          const allCatIds: string[] = [categoryId, ...subCategories.map((c: any) => String(c.id))];
          console.log('allCatIds:', allCatIds);
          
          // 3. Créer et sauvegarder les entités catégories
          const parentEntity = new CategoryEntity();
          parentEntity.id = categoryId;
          parentEntity.label = 'FC Chalon'; // On pourrait récupérer le label exact, mais pas critique
          
          catEntities = [
            parentEntity,
            ...subCategories.map((c: any) => {
              const entity = new CategoryEntity();
              entity.id = String(c.id);
              entity.label = c.label;
              entity.fkParent = categoryId;
              entity.parent = parentEntity;
              return entity;
            })
          ];
          
          try {
            // Sauvegarder les catégories
            await this.categoryRepository.save(catEntities);
            console.log(`✅ ${catEntities.length} catégories sauvegardées en base`);
          } catch (dbError) {
            console.error('❌ Erreur sauvegarde catégories:', dbError);
            throw dbError;
          }
          
          try {
            // 4. Récupérer directement les produits pour chaque catégorie via l'endpoint qui fonctionne
            const productsPromises = allCatIds.map(id => 
              this.dolibarrService.getProducts(Number(id), 0, true)
              .catch(error => {
                console.log(`⚠️ Catégorie ${id} sans produits (${error.message})`);
                return []; // Retourner un tableau vide en cas d'erreur
              })
            );
            
            const productsResults = await Promise.all(productsPromises);
            console.log('productsResults:', productsResults.map(a => a.length));
            
            // 5. Mapper les produits avec leur première catégorie rencontrée
            productsResults.forEach((products, index) => {
              const catId = allCatIds[index];
              products.forEach(prod => {
                const productId = String(prod.id);
                if (!productFirstCategory.has(productId)) {
                  productFirstCategory.set(productId, catId);
                }
              });
            });
            
            // 6. Fusionner et dédupliquer les produits
            const uniqueProducts = new Map<string, any>();
            productsResults.flat().forEach(product => {
              uniqueProducts.set(String(product.id), product);
            });
            
            dolibarrProducts = Array.from(uniqueProducts.values());
            console.log(`✅ ${dolibarrProducts.length} produits uniques récupérés`);
          } catch (productsError) {
            console.error('❌ Erreur récupération produits:', productsError);
            throw productsError;
          }
        } catch (categoriesError) {
          console.error('❌ Erreur récupération sous-catégories:', categoriesError);
          throw categoriesError;
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

      try {
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
            try {
              const catRef = await this.categoryRepository.findOne({ where: { id: mainCatId } });
              entity.category = catRef ?? this.categoryRepository.create({ id: mainCatId });
            } catch (catLookupError) {
              console.error(`❌ Erreur recherche catégorie ${mainCatId}:`, catLookupError);
            }
          }

          prodEntities.push(entity);
        }

        await this.productRepository.save(prodEntities);
        console.log(`✅ ${prodEntities.length} produits sauvegardés en base`);

        return {
          categories: catEntities.length,
          products: prodEntities.length,
        };
      } catch (productsError) {
        console.error('❌ Erreur traitement produits:', productsError);
        throw productsError;
      }
    } catch (error) {
      console.error('❌ ERREUR GLOBALE SYNC:', error);
      return {
        categories: 0,
        products: 0,
        error: error.message
      } as any;
    }
  }
} 