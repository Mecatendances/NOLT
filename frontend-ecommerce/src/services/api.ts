import axios from 'axios';
import { Product, Shop, CategoryTree } from '../types/shop';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  const tenantId = localStorage.getItem('tenantId');
  if (tenantId) {
    config.headers = config.headers || {};
    config.headers['X-Tenant-ID'] = tenantId;
  }
  return config;
});

// Données mock pour déboguer l'interface
const mockCategories183 = [
  { id: "184", label: "Maillots", description: "Maillots officiels FC Chalon" },
  { id: "185", label: "Shorts", description: "Shorts officiels FC Chalon" },
  { id: "186", label: "Accessoires", description: "Accessoires FC Chalon" },
  { id: "187", label: "Survêtements", description: "Survêtements officiels FC Chalon" }
];

// Simulation d'un stockage local des boutiques
const getStoredShops = (): Shop[] => {
  const shops = localStorage.getItem('shops');
  return shops ? JSON.parse(shops) : [];
};

const setStoredShops = (shops: Shop[]) => {
  localStorage.setItem('shops', JSON.stringify(shops));
};

// Initialize default shops si nécessaire
const initializeDefaultShops = () => {
  if (!localStorage.getItem('shops')) {
    setStoredShops([]);
  }
};
initializeDefaultShops();

export const shopApi = {
  // Produits
  getProducts: async (options?: { category?: string; shopId?: string }): Promise<Product[]> => {
    try {
      let url = '/dolibarr/products';
      const params: any = {};
      if (options?.category) {
        params.category = options.category;
      }
      if (options?.shopId) {
        params.shopId = options.shopId;
      }
      const response = await api.get(url, { params });
      console.log('Réponse API produits:', response.data);
      const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api');
      const staticBase = apiBase.replace(/\/api$/, '');
      return (response.data as any[]).map(prod => {
        console.log('Produit brut:', prod);
        const mapped = {
          id: Number(prod.id),
          ref: prod.ref,
          label: prod.label,
          webLabel: prod.webLabel,
          imageUrl: prod.imageUrl ? `${staticBase}${prod.imageUrl}` : undefined,
          price: parseFloat(prod.priceTtc ?? prod.price_ttc ?? prod.price ?? '0'),
          stock: prod.stock ?? 0,
          category: prod.category?.id ?? prod.category ?? '',
          description: prod.description,
        };
        console.log('Produit mappé:', mapped);
        return mapped;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des produits', error);
      return [];
    }
  },

  // Récupérer l'arborescence des catégories Dolibarr
  getCategoryTree: async (): Promise<CategoryTree[]> => {
    try {
      const response = await api.get('/dolibarr/categories/tree');
      return response.data as CategoryTree[];
    } catch (error) {
      console.error("Erreur lors de la récupération de l'arborescence des catégories", error);
      return [];
    }
  },

  // Récupérer la liste des catégories Dolibarr
  getCategories: async (): Promise<{ id: string; label: string }[]> => {
    try {
      const response = await api.get('/dolibarr/categories');
      return (response.data as any[]).map(cat => ({ id: String(cat.id), label: cat.label }));
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories', error);
      return [];
    }
  },

  // Récupérer les catégories filles d'une catégorie spécifique via l'API noltapi
  getCategoriesFilles: async (categoryId: string): Promise<any[]> => {
    try {
      console.log(`🔍 Récupération des catégories filles pour la catégorie ${categoryId}`);
      
      // Liste des endpoints à essayer
      const endpoints = [
        `/dolibarr/noltapi/categoriesFilles/${categoryId}`,
        `/dolibarr/categories/${categoryId}/children`,
        `/dolibarr/categories?parent=${categoryId}`
      ];
      
      // Essayer chaque endpoint jusqu'à ce qu'un fonctionne
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Tentative avec l'endpoint: ${endpoint}`);
          const response = await api.get(endpoint);
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            console.log(`✅ Endpoint ${endpoint} a fonctionné, ${response.data.length} catégories récupérées`);
            return response.data;
          } else if (response.data && typeof response.data === 'object') {
            // Vérifier si nous avons un tableau dans une propriété
            const possibleArrayKeys = ['children', 'categories', 'data', 'results'];
            for (const key of possibleArrayKeys) {
              if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
                console.log(`✅ Données extraites de response.data.${key}, ${response.data[key].length} catégories`);
                return response.data[key];
              }
            }
            // NOUVEAU : transformer l'objet en tableau si besoin
            const values = Object.values(response.data);
            if (values.length > 0 && typeof values[0] === 'object') {
              console.log('✅ Données extraites des valeurs de l\'objet réponse', values);
              return values;
            }
          }
          
          console.log(`⚠️ L'endpoint ${endpoint} a répondu mais sans données utilisables`);
        } catch (endpointError: any) {
          console.log(`⚠️ Échec de l'endpoint ${endpoint}: ${endpointError.message}`);
          // Continuer avec le prochain endpoint
        }
      }
      
      // Si aucun endpoint n'a fonctionné, lever une erreur
      throw new Error("Impossible de récupérer les catégories filles depuis l'API.");
    } catch (error) {
      console.warn('⚠️ Erreur API, aucune donnée retournée');
      throw error;
    }
  },

  // Gestion des boutiques
  createShop: async (shopData: Partial<Shop>): Promise<Shop> => {
    try {
      const response = await api.post('/shops', shopData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la boutique', error);
      throw error;
    }
  },

  getShops: async (): Promise<Shop[]> => {
    try {
      const response = await api.get('/shops');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des boutiques', error);
      return [];
    }
  },

  getShop: async (id: string): Promise<Shop> => {
    try {
      const response = await api.get(`/shops/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la boutique ${id}`, error);
      throw error;
    }
  },

  updateShop: async (id: string, shopData: Partial<Shop>): Promise<Shop> => {
    try {
      const response = await api.put(`/shops/${id}`, shopData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la boutique ${id}`, error);
      throw error;
    }
  },

  deleteShop: async (id: string): Promise<void> => {
    try {
      await api.delete(`/shops/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la boutique ${id}`, error);
      throw error;
    }
  },

  updateProduct: async (shopId: string, productId: number, productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await api.put(`/shops/${shopId}/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du produit ${productId}`, error);
      throw error;
    }
  },

  uploadProductImage: async (productId: number, formData: FormData): Promise<Product> => {
    try {
      const response = await api.post(`/dolibarr/products/${productId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du téléchargement de l'image pour le produit ${productId}`, error);
      throw error;
    }
  },

  updateWebLabel: async (productId: string, webLabel: string): Promise<void> => {
    try {
      await api.patch(`/dolibarr/products/${productId}/web-label`, { webLabel });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du nom d'affichage web du produit ${productId}`, error);
      throw error;
    }
  },
};

export const userApi = {
  getMyOrders: async () => {
    const response = await api.get('/orders/my');
    return response.data as any[];
  },
  getMe: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
  updateMe: async (patch: any) => {
    await api.put('/users/me', patch);
  },
};

export interface AdminStats {
  ordersCount: number;
  shopsCount: number;
  usersCount: number;
  campaignsCount: number;
  recentActivity: {
    type: 'order' | 'shop' | 'campaign';
    description: string;
    date: string;
  }[];
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};