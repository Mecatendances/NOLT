import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DolibarrService } from './dolibarr.service';
import { CategoryEntity } from '../catalog/entities/category.entity';
import { ProductEntity } from '../catalog/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';

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
    private dataSource: DataSource,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>
  ) {}

  /**
   * Synchronise les catégories et les produits Dolibarr dans la base locale.
   * 1. Récupère toutes les catégories puis effectue un upsert (insert ou update).
   * 2. Met à jour les relations parent/enfant.
   * 3. Récupère tous les produits puis effectue un upsert.
   * @returns nombre total d'éléments synchronisés
   */
  async sync(shopId: string): Promise<SyncResult | { message: string }> {
    try {
      // Récupère la boutique
      const shop = await this.shopRepository.findOne({ where: { id: shopId } });
      if (!shop) throw new Error('Boutique non trouvée');
      const dolibarrCategoryId = shop.dolibarrCategoryId;

      // Récupérer la racine et les sous-catégories
      const racine = {
        id: dolibarrCategoryId,
        label: shop.name,
        description: shop.description,
      };

      let categoriesFilles = await this.dolibarrService.getCategoriesFilles(String(dolibarrCategoryId));
      if (!Array.isArray(categoriesFilles)) {
        if (categoriesFilles && typeof categoriesFilles === 'object') {
          categoriesFilles = Object.values(categoriesFilles);
        } else {
          categoriesFilles = [];
        }
      }
      const allCategories = [racine, ...categoriesFilles];

      console.log('=== DEBUG shopId utilisé pour l\'import :', shopId);
      allCategories.forEach((cat: any) => {
        console.log('Catégorie à importer :', {
          id: cat.id,
          label: cat.label,
          description: cat.description,
          shopId: shopId
        });
      });

      // 1. Upsert des catégories (update si dolibarrId existe, sinon insert)
      for (const cat of allCategories) {
        let entity = await this.categoryRepository.findOne({ where: { dolibarrId: Number(cat.id) } });
        if (!entity) {
          entity = new CategoryEntity();
          entity.dolibarrId = Number(cat.id);
          entity.shopId = shopId;
        }
        entity.label = cat.label;
        entity.description = cat.description;
        entity.fkParent = null; // On mettra à jour après
        await this.categoryRepository.save(entity);
      }

      // 2. Mise à jour de la parentalité (toutes les catégories sauf la racine pointent vers la racine)
      const racineEntity = await this.categoryRepository.findOne({ where: { dolibarrId: Number(dolibarrCategoryId) } });
      if (racineEntity) {
        for (const cat of allCategories) {
          if (Number(cat.id) !== racineEntity.dolibarrId) {
            const child = await this.categoryRepository.findOne({ where: { dolibarrId: Number(cat.id) } });
            if (child) {
              child.fkParent = racineEntity.id;
              await this.categoryRepository.save(child);
            }
          }
        }
      }

      // 3. Synchronisation des produits par catégorie
      let totalProducts = 0;
      const productCategoryAssociations = [];
      for (const cat of allCategories) {
        if (Number(cat.id) === Number(dolibarrCategoryId)) continue; // ignorer la racine
        const catId = Number(cat.id);
        console.log(`📡 Récupération des produits pour la catégorie Dolibarr ${catId}`);
        let products = [];
        try {
          products = await this.dolibarrService.getCategoryProducts(catId); // à implémenter si besoin
        } catch (err) {
          console.error(`❌ Erreur récupération produits catégorie ${catId}:`, err.message);
          continue;
        }
        console.log(`  → ${products.length} produits trouvés pour la catégorie ${catId}`);
        for (const prod of products) {
          let entity = await this.productRepository.findOne({ where: { id: Number(prod.id) } });
          if (!entity) {
            entity = new ProductEntity();
            entity.id = Number(prod.id);
          }
          entity.ref = prod.ref;
          entity.label = prod.label;
          entity.priceHt = prod.price_ht ? Number(prod.price_ht) : 0;
          entity.priceTtc = prod.price_ttc ? Number(prod.price_ttc) : 0;
          entity.stock = prod.stock ? Number(prod.stock) : 0;
          entity.description = prod.description;
          entity.tvaTx = prod.tva_tx ? Number(prod.tva_tx) : 0;
          await this.productRepository.save(entity);
          productCategoryAssociations.push({ productId: entity.id, categoryId: catId });
          totalProducts++;
        }
      }
      console.log(`✅ ${totalProducts} produits importés/actualisés depuis Dolibarr.`);
      // Table pivot : product_categories
      if (productCategoryAssociations.length > 0) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
          await queryRunner.query('TRUNCATE TABLE product_categories');
          for (const assoc of productCategoryAssociations) {
            // Chercher l'id auto-incrémenté de la catégorie à partir du dolibarr_id
            const category = await this.categoryRepository.findOne({ where: { dolibarrId: assoc.categoryId } });
            if (category) {
              await queryRunner.query(
                `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [assoc.productId, category.id]
              );
            } else {
              console.warn(`Catégorie Dolibarr ${assoc.categoryId} non trouvée en base, association ignorée`);
            }
          }
          await queryRunner.commitTransaction();
          console.log(`✅ ${productCategoryAssociations.length} associations produit-catégorie insérées.`);
        } catch (err) {
          await queryRunner.rollbackTransaction();
          console.error('❌ Erreur lors de l\'insertion des associations produit-catégorie :', err);
        } finally {
          await queryRunner.release();
        }
      }

      return {
        categories: allCategories.length,
        products: totalProducts,
      };
    } catch (error) {
      console.error('❌ ERREUR GLOBALE SYNC:', error);
      return {
        message: `Erreur de synchronisation: ${error.message}`,
        categories: 0,
        products: 0,
        error: error.message
      } as any;
    }
  }

  /**
   * Synchronise les produits et leurs catégories depuis Dolibarr
   */
  async syncProductCategories(): Promise<void> {
    console.log('🔄 Début de la synchronisation des produits et catégories');
    
    try {
      // 1. Récupérer les produits depuis Dolibarr avec leurs catégories
      console.log('📡 Requête vers Dolibarr pour récupérer les produits avec leurs catégories...');
      const dolibarrProducts = await this.dolibarrService.getProducts(undefined, 0, true);
      
      console.log(`📦 ${dolibarrProducts.length} produits récupérés depuis Dolibarr`);
      
      // Vérification approfondie de la structure des données
      const sampleProduct = dolibarrProducts.length > 0 ? dolibarrProducts[0] : null;
      if (sampleProduct) {
        console.log('🔍 Structure d\'un produit exemple:', JSON.stringify({
          id: sampleProduct.id,
          label: sampleProduct.label,
          category: sampleProduct.category
        }, null, 2));
      }
      
      // Compter les produits avec catégories
      const productsWithCategories = dolibarrProducts.filter(
        p => typeof p.category === 'string' && p.category.length > 0
      );
      console.log(`ℹ️ ${productsWithCategories.length} produits sur ${dolibarrProducts.length} ont des catégories`);
      
      // Tableau pour stocker les associations produit-catégorie
      const productCategoryAssociations = [];
      
      // 2. Traiter chaque produit et ses catégories
      for (const dolibarrProduct of dolibarrProducts) {
        const productId = dolibarrProduct.id;
        
        // Essayer de trouver d'autres propriétés potentielles contenant des catégories
        const potentialCategoryFields = [
          'categoriesObject', 'categoryIds', 'category_ids', 'catids', 'cat_ids'
        ];
        
        for (const field of potentialCategoryFields) {
          if (dolibarrProduct[field]) {
            console.log(`  🔍 Propriété alternative trouvée '${field}':`, dolibarrProduct[field]);
          }
        }
        
        // Si le produit a une propriété 'category' simple, utilisons-la comme fallback
        if (dolibarrProduct.category && typeof dolibarrProduct.category === 'string') {
          console.log(`  💡 Utilisation du champ 'category' comme fallback: ${dolibarrProduct.category}`);
          productCategoryAssociations.push({
            productId,
            categoryId: dolibarrProduct.category
          });
        }
      }
      
      // 3. Insérer les associations dans la table pivot
      if (productCategoryAssociations.length > 0) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try {
          // Vider la table pivot existante
          console.log('🧹 Nettoyage de la table des associations produit-catégorie');
          await queryRunner.query('TRUNCATE TABLE product_categories');
          
          // Insérer les nouvelles associations
          console.log(`📥 Insertion de ${productCategoryAssociations.length} associations produit-catégorie`);
          
          for (const association of productCategoryAssociations) {
            try {
              await queryRunner.query(
                `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)`,
                [association.productId, association.categoryId]
              );
            } catch (insertError) {
              console.error(`❌ Erreur insertion association ${association.productId}-${association.categoryId}:`, insertError.message);
            }
          }
          
          await queryRunner.commitTransaction();
          console.log('✅ Synchronisation des associations produit-catégorie terminée avec succès!');
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error('❌ Erreur lors de la synchronisation des associations produit-catégorie:', error);
          throw error;
        } finally {
          await queryRunner.release();
        }
      } else {
        console.warn('⚠️ Aucune association produit-catégorie trouvée dans Dolibarr');
        
        // Vérifions manuellement la propriété d'un produit pour comprendre le problème
        const sampleProducts = dolibarrProducts.slice(0, 3);
        sampleProducts.forEach((prod, index) => {
          console.log(`\nProduit #${index + 1} (${prod.id} - ${prod.label}):`);
          console.log('Propriétés disponibles:', Object.keys(prod));
          
          // Rechercher d'autres propriétés qui pourraient contenir des informations de catégorie
          Object.keys(prod).forEach(key => {
            if (key.toLowerCase().includes('cat')) {
              console.log(`Champ potentiel '${key}':`, prod[key]);
            }
          });
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation avec Dolibarr:', error);
      throw error;
    }
  }

  /**
   * Méthode alternative pour synchroniser les produits et leurs catégories
   * en utilisant une approche différente qui interroge directement les produits par catégorie
   */
  async syncProductCategoriesAlternative(): Promise<void> {
    console.log('🔄 Début de la synchronisation alternative des produits et catégories');
    
    try {
      // 1. Récupérer toutes les catégories
      const categories = await this.dolibarrService.getCategories();
      console.log(`📊 ${categories.length} catégories récupérées`);
      
      // 2. Pour chaque catégorie, récupérer ses produits
      const productCategoryAssociations = [];
      
      // On se concentre sur les catégories de FC Chalon (183 et ses enfants)
      const fcChalonCategories = categories.filter(cat => 
        cat.id === '183' || cat.fk_parent === '183'
      );
      
      console.log(`🔍 Traitement de ${fcChalonCategories.length} catégories FC Chalon`);
      
      for (const category of fcChalonCategories) {
        console.log(`⏳ Récupération des produits pour la catégorie ${category.id} (${category.label})`);
        
        try {
          // Récupérer les produits pour cette catégorie
          const products = await this.dolibarrService.getProducts(Number(category.id), 0, true);
          console.log(`  ✅ ${products.length} produits trouvés dans la catégorie ${category.id}`);
          
          // Ajouter les associations
          products.forEach(product => {
            productCategoryAssociations.push({
              productId: product.id,
              categoryId: category.id
            });
          });
        } catch (error) {
          console.error(`  ❌ Erreur récupération produits catégorie ${category.id}:`, error.message);
        }
      }
      
      console.log(`🔢 Total: ${productCategoryAssociations.length} associations produit-catégorie`);
      
      // 3. Insérer les associations dans la table pivot
      if (productCategoryAssociations.length > 0) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try {
          // Vider la table pivot existante
          console.log('🧹 Nettoyage de la table des associations produit-catégorie');
          await queryRunner.query('TRUNCATE TABLE product_categories');
          
          // Insérer les nouvelles associations
          console.log(`📥 Insertion de ${productCategoryAssociations.length} associations produit-catégorie`);
          
          for (const association of productCategoryAssociations) {
            try {
              await queryRunner.query(
                `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)`,
                [association.productId, association.categoryId]
              );
            } catch (insertError) {
              console.error(`❌ Erreur insertion association ${association.productId}-${association.categoryId}:`, insertError.message);
            }
          }
          
          await queryRunner.commitTransaction();
          
          // Vérifier le nombre de lignes insérées
          const rowCount = await queryRunner.query('SELECT COUNT(*) as count FROM product_categories');
          console.log(`✅ Synchronisation terminée. Nombre de lignes dans product_categories: ${rowCount[0].count}`);
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error('❌ Erreur lors de la synchronisation des associations produit-catégorie:', error);
          throw error;
        } finally {
          await queryRunner.release();
        }
      } else {
        console.warn('⚠️ Aucune association produit-catégorie trouvée');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation alternative:', error);
      throw error;
    }
  }

  /**
   * Troisième méthode pour synchroniser les produits et leurs catégories
   * en utilisant l'endpoint /products/{productId}/categories
   */
  async syncProductCategoriesCorrect(): Promise<void> {
    console.log('🔄 Début de la synchronisation correcte des produits et catégories');
    
    try {
      // 1. Récupérer tous les produits
      const allProducts = await this.dolibarrService.getProducts();
      console.log(`📦 ${allProducts.length} produits récupérés de Dolibarr`);
      
      // 2. Pour chaque produit, récupérer ses catégories via l'endpoint spécifique
      const productCategoryAssociations = [];
      
      for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        console.log(`⏳ Produit ${i+1}/${allProducts.length} - Récupération des catégories pour le produit ${product.id} (${product.label})`);
        
        try {
          // Récupérer les catégories pour ce produit
          const categories = await this.dolibarrService.getProductCategories(product.id);
          
          if (categories.length > 0) {
            console.log(`  ✅ ${categories.length} catégorie(s) trouvée(s) pour le produit ${product.id}`);
            
            // Ajouter les associations
            for (const category of categories) {
              productCategoryAssociations.push({
                productId: product.id,
                categoryId: category.id
              });
              console.log(`    - Catégorie ${category.id} (${category.label})`);
            }
          } else {
            console.log(`  ℹ️ Aucune catégorie trouvée pour le produit ${product.id}`);
          }
        } catch (error) {
          console.error(`  ❌ Erreur récupération catégories pour le produit ${product.id}:`, error.message);
        }
      }
      
      console.log(`🔢 Total: ${productCategoryAssociations.length} associations produit-catégorie`);
      
      // 3. Vérifier et insérer les associations dans la table pivot
      if (productCategoryAssociations.length > 0) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try {
          // Vider la table pivot existante
          console.log('🧹 Nettoyage de la table des associations produit-catégorie');
          await queryRunner.query('TRUNCATE TABLE product_categories');
          
          // Obtenir les IDs des produits et catégories existants dans la base de données
          const existingProducts = await this.productRepository.find({ select: ['id'] });
          const existingCategories = await this.categoryRepository.find({ select: ['id'] });
          
          const existingProductIds = new Set(existingProducts.map(p => p.id));
          const existingCategoryIds = new Set(existingCategories.map(c => c.id));
          
          console.log(`📊 Vérification avec ${existingProductIds.size} produits et ${existingCategoryIds.size} catégories en base`);
          
          // Filtrer les associations valides (produit et catégorie existent en base)
          const validAssociations = productCategoryAssociations.filter(assoc => 
            existingProductIds.has(Number(assoc.productId)) &&
            existingCategoryIds.has(Number(assoc.categoryId))
          );
          
          console.log(`📥 Insertion de ${validAssociations.length} associations produit-catégorie valides (${productCategoryAssociations.length - validAssociations.length} ignorées)`);
          
          // Insérer les associations valides
          let insertedCount = 0;
          
          for (const association of validAssociations) {
            try {
              await queryRunner.query(
                `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)`,
                [association.productId, association.categoryId]
              );
              insertedCount++;
            } catch (insertError) {
              console.error(`❌ Erreur insertion association ${association.productId}-${association.categoryId}:`, insertError.message);
            }
          }
          
          await queryRunner.commitTransaction();
          
          // Vérifier le nombre de lignes insérées
          const rowCount = await queryRunner.query('SELECT COUNT(*) as count FROM product_categories');
          console.log(`✅ Synchronisation terminée. ${insertedCount} associations insérées, ${rowCount[0].count} lignes dans product_categories`);
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error('❌ Erreur lors de la synchronisation des associations produit-catégorie:', error);
          throw error;
        } finally {
          await queryRunner.release();
        }
      } else {
        console.warn('⚠️ Aucune association produit-catégorie trouvée');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation avec Dolibarr:', error);
      throw error;
    }
  }

  /**
   * Insère manuellement une liste d'associations produit-catégorie.
   * @param associations Tableau d'objets { productId, categoryId }
   */
  async insertManualAssociations(associations: { productId: string; categoryId: string }[]) {
    console.log(`🔧 Insertion manuelle de ${associations.length} associations produit-catégorie…`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let inserted = 0;

      // Charger tous les IDs produits / catégories existants pour éviter les erreurs FK
      const productIds = new Set((await this.productRepository.find({ select: ['id'] })).map(p => p.id));
      const categoryIds = new Set((await this.categoryRepository.find({ select: ['id'] })).map(c => c.id));

      for (const assoc of associations) {
        if (!productIds.has(Number(assoc.productId))) {
          console.warn(`⚠️ Produit ${assoc.productId} manquant – association ignorée`);
          continue;
        }
        if (!categoryIds.has(Number(assoc.categoryId))) {
          console.warn(`⚠️ Catégorie ${assoc.categoryId} manquante – association ignorée`);
          continue;
        }

        try {
          await queryRunner.query(
            `INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [assoc.productId, assoc.categoryId]
          );
          inserted++;
        } catch (err) {
          console.error(`❌ Erreur insertion ${assoc.productId}-${assoc.categoryId}:`, err.message);
        }
      }

      await queryRunner.commitTransaction();
      console.log(`✅ Insertion terminée. ${inserted} associations insérées.`);
      return { inserted };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Erreur lors de l\'insertion manuelle :', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
} 