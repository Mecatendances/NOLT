import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Product, DolibarrProduct, DolibarrImage, CategoryTree } from './interfaces';

@Injectable()
export class DolibarrService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.baseUrl = this.configService.get<string>('DOLIBARR_API_URL');
    this.apiKey = this.configService.get<string>('DOLIBARR_API_KEY');
    console.log('=== Configuration API Dolibarr ===');
    console.log('URL configurée:', this.baseUrl);
    console.log('================================');
  }

  async getProducts(categoryId?: number, page = 0, includeStock = false) {
    try {
      const url = `${this.baseUrl}/products`;
      const params: any = {
        DOLAPIKEY: this.apiKey,
        limit: 999999,
        page: 0,
        includestockdata: includeStock ? 1 : 0,
        withcategories: 1
      };

      if (categoryId) {
        params.category = categoryId;
      }

      console.log(`📡 Requête vers Dolibarr: ${url} avec paramètres:`, params);

      const response = await this.httpService.axiosRef.get(url, { params });

      if (!Array.isArray(response.data)) {
        console.error(`⚠️ Réponse inattendue:`, response.data);
        throw new Error('Réponse invalide reçue de Dolibarr');
      }

      // Traiter les produits avec leurs catégories
      const productsWithCategories = response.data.map(product => {
        let categoryLabel = '-';
        
        if (product.categories && Array.isArray(product.categories)) {
          categoryLabel = product.categories.map(cat => cat.label).join(', ');
        }

        return {
          ...product,
          price_ht: parseFloat(product.price),
          price_ttc_number: parseFloat(product.price_ttc),
          stock: product.stock_reel ? parseInt(product.stock_reel) : 0,
          category: categoryLabel
        };
      });

      console.log(`✅ Produits récupérés (${productsWithCategories.length} résultats)`);
      return productsWithCategories;
    } catch (err) {
      console.error('❌ Erreur récupération produits Dolibarr:', err.response?.data || err.message);
      throw new Error(`Impossible de récupérer les produits : ${err.response?.data?.message || err.message}`);
    }
  }

  async getCategories() {
    try {
      const url = `${this.baseUrl}/categories`;
      const params = { 
        DOLAPIKEY: this.apiKey, 
        type: 0,
        limit: 999999
      };

      console.log(`📡 Requête vers Dolibarr: ${url} avec paramètres:`, params);

      const response = await this.httpService.axiosRef.get(url, { params });

      if (!Array.isArray(response.data)) {
        console.error(`⚠️ Réponse inattendue:`, response.data);
        throw new Error('Réponse invalide reçue de Dolibarr');
      }

      console.log(`✅ Catégories récupérées (${response.data.length} résultats)`);
      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération catégories Dolibarr:', err.response?.data || err.message);
      throw new Error(`Impossible de récupérer les catégories : ${err.response?.data?.message || err.message}`);
    }
  }

  async getThirdParties() {
    try {
      const url = `${this.baseUrl}/thirdparties`;
      const params = { 
        DOLAPIKEY: this.apiKey,
        limit: 999999
      };

      console.log(`📡 Requête vers Dolibarr: ${url} avec paramètres:`, params);

      const response = await this.httpService.axiosRef.get(url, { params });

      if (!Array.isArray(response.data)) {
        console.error(`⚠️ Réponse inattendue:`, response.data);
        throw new Error('Réponse invalide reçue de Dolibarr');
      }

      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération tiers Dolibarr:', err.response?.data || err.message);
      throw new Error(`Impossible de récupérer les tiers : ${err.response?.data?.message || err.message}`);
    }
  }

  async getProductById(productId: number) {
    try {
      const url = `${this.baseUrl}/products/${productId}`;
      const params = {
        DOLAPIKEY: this.apiKey
      };

      const response = await this.httpService.axiosRef.get(url, { params });
      return response.data;
    } catch (err) {
      throw new Error(`Impossible de récupérer le produit : ${err.response?.data?.message || err.message}`);
    }
  }

  async getProduct(id: string): Promise<DolibarrProduct> {
    try {
      const response = await this.httpService.axiosRef.get<DolibarrProduct>(
        `${this.baseUrl}/products/${id}`,
        {
          headers: {
            'DOLAPIKEY': this.apiKey,
          },
        }
      );
      
      const product = response.data;
      
      return {
        ...product,
        price_ht: parseFloat(product.price),
        price_ttc_number: parseFloat(product.price_ttc),
        stock: product.stock_reel ? parseInt(product.stock_reel) : 0,
        category: '-'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      throw new Error('Impossible de récupérer le produit');
    }
  }

  async getCategoryTree(): Promise<CategoryTree[]> {
    try {
      console.log('🔍 Début de la récupération de l\'arborescence des catégories');
      
      // 1. Récupérer toutes les catégories
      const categoriesResponse = await this.httpService.axiosRef.get(
        `${this.baseUrl}/categories`,
        {
          params: {
            DOLAPIKEY: this.apiKey,
            type: 0,
            limit: 999999
          }
        }
      );

      if (!Array.isArray(categoriesResponse.data)) {
        throw new Error('Format de réponse invalide pour les catégories');
      }

      const categories = categoriesResponse.data;
      console.log(`✅ ${categories.length} catégories récupérées`);
      
      // 2. Créer la map des catégories avec les IDs en string
      const categoryMap = new Map<string, CategoryTree>();
      categories.forEach((cat: any) => {
        categoryMap.set(String(cat.id), {
          ...cat,
          id: String(cat.id),
          fk_parent: String(cat.fk_parent),
          children: [],
          products: [] // On garde le tableau de produits
        });
      });

      // 3. Pour chaque catégorie, récupérer ses produits via l'endpoint dédié
      for (const category of categories) {
        try {
          const productsResponse = await this.httpService.axiosRef.get(
            `${this.baseUrl}/categories/${category.id}/products`,
            {
              params: {
                DOLAPIKEY: this.apiKey,
                limit: 999999
              }
            }
          );

          if (Array.isArray(productsResponse.data)) {
            const categoryProducts = productsResponse.data;
            const cat = categoryMap.get(String(category.id));
            if (cat) {
              cat.products = categoryProducts.map(product => ({
                ...product,
                price_ht: parseFloat(product.price),
                price_ttc_number: parseFloat(product.price_ttc),
                stock: product.stock_reel ? parseInt(product.stock_reel) : 0
              }));
            }
          }
        } catch (error) {
          console.warn(`⚠️ Impossible de récupérer les produits pour la catégorie ${category.id}:`, error.message);
        }
      }

      // 4. Construire l'arborescence
      const rootCategories: CategoryTree[] = [];
      
      // Associer les enfants à leurs parents
      categories.forEach((cat: any) => {
        const categoryId = String(cat.id);
        const parentId = String(cat.fk_parent);
        const category = categoryMap.get(categoryId);
        
        if (!category) {
          console.error(`❌ Catégorie ${categoryId} non trouvée dans la map`);
          return;
        }

        if (parentId && parentId !== '0' && parentId !== categoryId) {
          const parent = categoryMap.get(parentId);
          if (parent) {
            if (!parent.children) {
              parent.children = [];
            }
            if (!parent.children.find(child => child.id === categoryId)) {
              parent.children.push(category);
            }
          } else {
            if (!rootCategories.find(root => root.id === categoryId)) {
              rootCategories.push(category);
            }
          }
        } else {
          if (!rootCategories.find(root => root.id === categoryId)) {
            rootCategories.push(category);
          }
        }
      });

      // 5. Trier les catégories et les produits
      const sortItems = (categories: CategoryTree[]) => {
        // Trier les catégories
        categories.sort((a, b) => {
          const aHasPrefix = a.label.startsWith('00');
          const bHasPrefix = b.label.startsWith('00');
          
          if (aHasPrefix && !bHasPrefix) return -1;
          if (!aHasPrefix && bHasPrefix) return 1;
          
          return a.label.localeCompare(b.label);
        });

        // Trier les produits dans chaque catégorie
        categories.forEach(category => {
          if (category.products && category.products.length > 0) {
            category.products.sort((a, b) => a.label.localeCompare(b.label));
          }
          if (category.children && category.children.length > 0) {
            sortItems(category.children);
          }
        });
      };

      sortItems(rootCategories);

      console.log('✅ Construction de l\'arborescence terminée');
      console.log(`📊 Nombre de catégories racines: ${rootCategories.length}`);
      
      return rootCategories;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'arborescence des catégories:', error);
      throw new Error(`Impossible de récupérer l'arborescence des catégories: ${error.message}`);
    }
  }

  async getCategoryProducts(categoryId: string): Promise<DolibarrProduct[]> {
    try {
      const url = `${this.baseUrl}/categories/${categoryId}/objects`;
      const params = { 
        DOLAPIKEY: this.apiKey,
        type: 'product'
      };

      console.log(`📡 Requête vers Dolibarr: ${url} avec paramètres:`, params);

      const response = await this.httpService.axiosRef.get(url, { params });

      if (!Array.isArray(response.data)) {
        console.error('⚠️ Réponse inattendue:', response.data);
        throw new Error('Réponse invalide reçue de Dolibarr');
      }

      // Si nous avons des IDs de produits, nous devons récupérer les détails de chaque produit
      const productIds = response.data;
      const products: DolibarrProduct[] = [];

      // Récupérer les détails de chaque produit
      for (const productId of productIds) {
        try {
          const productResponse = await this.httpService.axiosRef.get(
            `${this.baseUrl}/products/${productId}`,
            { params: { DOLAPIKEY: this.apiKey } }
          );

          const product = productResponse.data;
          products.push({
            ...product,
            price_ht: parseFloat(product.price),
            price_ttc_number: parseFloat(product.price_ttc),
            stock: product.stock_reel ? parseInt(product.stock_reel) : 0
          });
        } catch (error) {
          console.warn(`⚠️ Impossible de récupérer les détails du produit ${productId}:`, error.message);
        }
      }

      console.log(`✅ Produits récupérés pour la catégorie ${categoryId} (${products.length} résultats)`);
      return products;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des produits de la catégorie ${categoryId}:`, error.message);
      throw new Error(`Impossible de récupérer les produits de la catégorie : ${error.message}`);
    }
  }
}