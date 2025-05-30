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
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('DOLIBARR_API_URL');
    this.apiKey = this.configService.get<string>('DOLIBARR_API_KEY');
    console.log('=== Configuration API Dolibarr ===');
    console.log('URL configurée:', this.baseUrl);
    console.log('================================');
  }

  async getProducts(categoryId?: number, page = 0, includeStock = false): Promise<DolibarrProduct[]> {
    // TODO: Remplacer par appel à l'API Dolibarr ou logique adaptée
    return [];
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

  async getCategoriesFilles(categoryId: string): Promise<any> {
    try {
      // Essayer d'abord l'API réelle
      const externalApiUrl = 'https://dbdev.wearenolt.net/htdocs/api/index.php';
      console.log(`📡 [DEBUG] Tentative d'appel à l'API réelle: ${externalApiUrl}/noltapi/categoriesFilles/${categoryId}`);
      
      try {
        // Appel à l'API réelle
        const response = await this.httpService.axiosRef.get(
          `${externalApiUrl}/noltapi/categoriesFilles/${categoryId}`,
          { 
            params: { DOLAPIKEY: this.apiKey },
            timeout: 10000
          }
        );
        
        console.log(`✅ [DEBUG] API réelle a répondu avec statut ${response.status}`);
        return response.data;
      } catch (apiError) {
        console.error(`❌ [DEBUG] Échec de l'API réelle: ${apiError.message}`);
        
        // En cas d'échec, essayer l'API standard categories
        try {
          console.log(`📡 [DEBUG] Tentative avec l'endpoint categories standard`);
          const categoriesResponse = await this.httpService.axiosRef.get(
            `${externalApiUrl}/categories/${categoryId}/children`,
            { 
              params: { DOLAPIKEY: this.apiKey },
              timeout: 10000
            }
          );
          
          console.log(`✅ [DEBUG] Endpoint categories a répondu avec statut ${categoriesResponse.status}`);
          return categoriesResponse.data;
        } catch (categoriesError) {
          console.error(`❌ [DEBUG] Échec de l'endpoint categories: ${categoriesError.message}`);
          // Plus de fallback, on lève une erreur
          throw new Error(`Impossible de récupérer les catégories filles : ${categoriesError.message}`);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des catégories filles ${categoryId}:`, error.message);
      throw new Error(`Impossible de récupérer les catégories filles : ${error.message}`);
    }
  }

  async getProductsByCategoryEndpoint(categoryId: number, includeStock = true) {
    try {
      const url = `${this.baseUrl}/categories/${categoryId}/products`;
      const params: any = {
        DOLAPIKEY: this.apiKey,
        limit: 999999,
        includestockdata: includeStock ? 1 : 0,
        withcategories: 1
      };
      console.log(`📡 Requête Dolibarr cat-products: ${url}`, params);
      const response = await this.httpService.axiosRef.get(url, { params });
      if (Array.isArray(response.data)) {
        return response.data.map(product => ({
          ...product,
          price_ht: parseFloat(product.price),
          price_ttc_number: parseFloat(product.price_ttc),
          stock: product.stock_reel ? parseInt(product.stock_reel) : 0,
        }));
      }
      // Fallback vers /products?category=
      console.warn('cat-products non disponible, fallback sur /products');
      return this.getProducts(categoryId, 0, includeStock);
    } catch (err) {
      if (err?.response?.status === 404) {
        console.warn(`cat-products 404 pour la catégorie ${categoryId} – fallback /products?category`);
        return this.getProducts(categoryId, 0, includeStock);
      }
      console.error('Erreur cat-products', err.response?.data || err.message);
      return [];
    }
  }

  async getProductCategories(productId: string | number): Promise<any[]> {
    try {
      const externalApiUrl = 'https://dbdev.wearenolt.net/htdocs/api/index.php';
      const url = `${externalApiUrl}/products/${productId}/categories`;
      
      const params: any = {
        DOLAPIKEY: this.apiKey,
        sortfield: 's.rowid',
        sortorder: 'ASC'
      };

      console.log(`📡 Requête vers Dolibarr pour les catégories du produit ${productId}: ${url}`);

      const response = await this.httpService.axiosRef.get(url, { params });
      
      if (!Array.isArray(response.data)) {
        console.warn(`⚠️ Réponse inattendue pour les catégories du produit ${productId}:`, response.data);
        return [];
      }
      
      console.log(`✅ ${response.data.length} catégories trouvées pour le produit ${productId}`);
      return response.data;
    } catch (err) {
      console.error(`❌ Erreur récupération catégories du produit ${productId}:`, err.response?.data || err.message);
      return [];
    }
  }

  async updateWebLabel(productId: string, webLabel: string) {
    // const product = await this.productRepository.findOneBy({ id: Number(productId) });
    // if (!product) throw new Error('Produit non trouvé');
    // product.webLabel = webLabel;
    // return this.productRepository.save(product);
  }

  async getCategoryProducts(categoryId: number, includeStock = true) {
    try {
      const url = `${this.baseUrl}/categories/${categoryId}/objects`;
      const params: any = {
        DOLAPIKEY: this.apiKey,
        type: 'product',
        limit: 999999,
        includestockdata: includeStock ? 1 : 0,
        withcategories: 1
      };
      console.log(`📡 Requête Dolibarr cat-objects: ${url}`, params);
      const response = await this.httpService.axiosRef.get(url, { params });
      if (Array.isArray(response.data)) {
        return response.data.map(product => ({
          ...product,
          price_ht: parseFloat(product.price),
          price_ttc_number: parseFloat(product.price_ttc),
          stock: product.stock_reel ? parseInt(product.stock_reel) : 0,
        }));
      }
      return [];
    } catch (err) {
      if (err?.response?.status === 404) {
        console.warn(`cat-objects 404 pour la catégorie ${categoryId}`);
        return [];
      }
      console.error('Erreur cat-objects', err.response?.data || err.message);
      return [];
    }
  }
}