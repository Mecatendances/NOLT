import axios from 'axios';
import { Product, Shop, CategoryTree } from '../types/shop';

const api = axios.create({
  baseURL: '/api'
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
  getProducts: async (options?: { category?: string }): Promise<Product[]> => {
    try {
      let url = '/dolibarr/products';
      const params: any = {};
      if (options && options.category) {
        params.category = options.category;
      }
      const response = await api.get(url, { params });
      // Mapper la réponse Dolibarr vers le type Product du frontend
      return (response.data as any[]).map(prod => ({
        id: Number(prod.id),
        ref: prod.ref,
        label: prod.label,
        price: prod.price_ttc_number ?? parseFloat(prod.price),
        stock: prod.stock ?? 0,
        category: prod.category ?? '',
        description: prod.description,
        image_url: Array.isArray(prod.image_url) ? prod.image_url[0] : undefined,
      }));
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
        `/dolibarr/noltapi/categoriesFilles/${categoryId}`
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
            // Nouveau : transformer l'objet en tableau si besoin
            if (Object.values(response.data).length > 0 && typeof Object.values(response.data)[0] === 'object') {
              const categoriesArray = Object.values(response.data);
              console.log('✅ Données extraites des valeurs de l\'objet réponse', categoriesArray);
              return categoriesArray;
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
      // Pour la démo, utiliser mockup avec délai simulé
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newShop: Shop = {
        id: Date.now(),
        name: shopData.name || "",
        description: shopData.description || "",
        products: shopData.products || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const shops = getStoredShops();
      shops.push(newShop);
      setStoredShops(shops);

      return newShop;
    } catch (error) {
      console.error('Erreur lors de la création de la boutique', error);
      throw error;
    }
  },

  getShops: async (): Promise<Shop[]> => {
    try {
      // Pour la démo, utiliser mockup avec délai simulé
      await new Promise(resolve => setTimeout(resolve, 300));
      return getStoredShops();
    } catch (error) {
      console.error('Erreur lors de la récupération des boutiques', error);
      return [];
    }
  },

  getShop: async (id: number): Promise<Shop> => {
    try {
      // Pour la démo, utiliser mockup avec délai simulé
      await new Promise(resolve => setTimeout(resolve, 300));
      const shops = getStoredShops();
      const shop = shops.find(s => s.id === id);
      if (!shop) {
        throw new Error("Boutique non trouvée");
      }
      return shop;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la boutique ${id}`, error);
      throw error;
    }
  },

  updateShop: async (id: number, shopData: Partial<Shop>): Promise<Shop> => {
    try {
      // Pour la démo, utiliser mockup avec délai simulé
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const shops = getStoredShops();
      const index = shops.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error("Boutique non trouvée");
      }

      const updatedShop: Shop = {
        ...shops[index],
        ...shopData,
        updated_at: new Date().toISOString()
      };

      shops[index] = updatedShop;
      setStoredShops(shops);

      return updatedShop;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la boutique ${id}`, error);
      throw error;
    }
  },

  deleteShop: async (id: number): Promise<void> => {
    try {
      // Pour la démo, utiliser mockup avec délai simulé
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const shops = getStoredShops();
      const filteredShops = shops.filter(s => s.id !== id);
      setStoredShops(filteredShops);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la boutique ${id}`, error);
      throw error;
    }
  }
};