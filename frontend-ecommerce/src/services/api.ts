import axios from 'axios';
import { Product, Shop, CategoryTree, ProductImage } from '../types/shop';

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
      let url = '/catalog/products';
      if (options?.category) {
        url = `/catalog/categories/${options.category}/products`;
      }
      console.log('Requête API produits:', { url });
      const response = await api.get(url);
      const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api');
      const staticBase = apiBase.replace(/\/api$/, '');
      return (response.data as any[]).map(prod => {
        const images = Array.isArray(prod.images)
          ? prod.images
              .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
              .map((img: any) => {
                if (!img.url) return null;
                return img.url.startsWith('http') ? img.url : `${staticBase}${img.url}`;
              })
              .filter(Boolean) as string[]
          : [];
        // Fallback si aucune image dans le tableau mais une imageUrl simple est disponible
        if (images.length === 0 && (prod.imageUrl || prod.image_url)) {
          const imageUrl = prod.imageUrl || prod.image_url;
          images.push(imageUrl.startsWith('http') ? imageUrl : `${staticBase}${imageUrl}`);
        }
        return {
          id: Number(prod.id),
          ref: prod.ref,
          label: prod.label,
          webLabel: prod.webLabel,
          images,
          price: parseFloat(prod.priceTtc ?? prod.price_ttc ?? prod.price ?? '0'),
          stock: prod.stock ?? 0,
          category: prod.category?.id ?? prod.category ?? '',
          description: prod.description,
        };
      });
    } catch (error: any) {
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

  // Récupérer les catégories filles d'une catégorie spécifique via l'API locale
  getCategoriesFilles: async (categoryId: string): Promise<any[]> => {
    try {
      console.log(`🔍 Récupération des catégories filles pour la catégorie ${categoryId}`);
      const response = await api.get(`/catalog/categoriesFilles/${categoryId}`);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Si la réponse n'est pas un tableau, on tente de l'extraire
      const values = Object.values(response.data);
      if (values.length > 0 && typeof values[0] === 'object') {
        return values;
      }
      return [];
    } catch (error) {
      console.warn('⚠️ Erreur API locale, aucune donnée retournée');
      console.error('Détails de l\'erreur:', error);
      return [];
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
      const shopData = response.data as any;

      if (shopData.products && Array.isArray(shopData.products)) {
        const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api');
        const staticBase = apiBase.replace(/\/api$/, '');
        
        console.log('[getShop] Produits avant transformation:', shopData.products);
        
        shopData.products = shopData.products.map((prod: any) => {
          const images = Array.isArray(prod.images)
            ? prod.images
                .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                .map((img: any) => {
                  if (!img.url) return null;
                  return img.url.startsWith('http') ? img.url : `${staticBase}${img.url}`;
                })
                .filter(Boolean) as string[]
            : [];
          console.log(`[getShop] Produit ${prod.id} - Images transformées:`, images);
          
          const mappedProduct: Product = {
            id: Number(prod.id),
            ref: prod.ref,
            label: prod.label,
            price: parseFloat(prod.priceTtc ?? prod.price_ttc ?? prod.price ?? '0'),
            stock: Number(prod.stock ?? 0),
            webLabel: prod.webLabel || prod.label,
            images,
            category: prod.category?.id ?? prod.category ?? '',
            description: prod.description,
            subCategoryIds: prod.subCategoryIds,
            ...(prod as object),
          };
          console.log(`[getShop] Produit ${prod.id} - Données finales:`, mappedProduct);
          return mappedProduct;
        });
      }

      return shopData as Shop;
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

  updateProduct: async (shopId: string, productId: number, productData: Partial<Product>): Promise<any> => {
    try {
      const payload = { customWebLabel: productData.webLabel };
      const response = await api.put(`/catalog/shops/${shopId}/products/${productId}/web-label`, payload);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du webLabel custom pour le produit ${productId} dans la boutique ${shopId}`, error);
      throw error;
    }
  },

  uploadProductImage: async (productId: number, formData: FormData): Promise<ProductImage> => {
    try {
      const response = await api.post(`/products/${productId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Préfixe l'URL retournée pour qu'elle pointe vers le backend
      const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api');
      const staticBase = apiBase.replace(/\/api$/, '');
      return {
        ...response.data,
        url: `${staticBase}${response.data.url}`,
      } as ProductImage;
    } catch (error) {
      console.error(`Erreur lors du téléchargement de l'image pour le produit ${productId}`, error);
      throw error;
    }
  },

  deleteProductImage: async (imageId: number): Promise<void> => {
    try {
      await api.delete(`/products/images/${imageId}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'image ${imageId}`, error);
      throw error;
    }
  },

  reorderProductImages: async (productId: number, imageIds: number[]): Promise<void> => {
    try {
      await api.post(`/products/${productId}/images/reorder`, { imageIds });
    } catch (error) {
      console.error(`Erreur lors du réordre des images du produit ${productId}`, error);
      throw error;
    }
  },

  getProductImages: async (productId: number): Promise<ProductImage[]> => {
    try {
      const response = await api.get(`/products/${productId}/images`);
      const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api');
      const staticBase = apiBase.replace(/\/api$/, '');
      return (response.data as ProductImage[]).map(img => ({
        ...img,
        url: `${staticBase}${img.url}`,
      }));
    } catch (error) {
      console.error(`Erreur lors de la récupération des images du produit ${productId}`, error);
      return [];
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

  getShopByDolibarrCategoryId: async (dolibarrCategoryId: string): Promise<Shop | null> => {
    try {
      const response = await api.get<Shop>(`/catalog/shops/by-dolibarr-category/${dolibarrCategoryId}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error(`Erreur lors de la récupération de la boutique par Dolibarr Category ID ${dolibarrCategoryId}`, error);
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