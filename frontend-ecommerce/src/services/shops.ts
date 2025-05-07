import { supabase } from './supabase';
import type { Shop, Product } from '../types/shop';

export const shopsService = {
  // Récupérer toutes les boutiques
  getShops: async (): Promise<Shop[]> => {
    const { data: shops, error } = await supabase
      .from('shops')
      .select(`
        *,
        products:shop_products(
          product:products(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return shops.map(shop => ({
      ...shop,
      products: shop.products.map((p: any) => p.product)
    }));
  },

  // Récupérer une boutique par son ID
  getShop: async (id: string): Promise<Shop> => {
    const { data: shop, error } = await supabase
      .from('shops')
      .select(`
        *,
        products:shop_products(
          product:products(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...shop,
      products: shop.products.map((p: any) => p.product)
    };
  },

  // Créer une nouvelle boutique
  createShop: async (shopData: { name: string; description: string; products: Product[] }): Promise<Shop> => {
    const { name, description, products } = shopData;

    // Démarrer une transaction
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .insert({ name, description })
      .select()
      .single();

    if (shopError) throw shopError;

    // Ajouter les produits à la boutique
    if (products.length > 0) {
      const shopProducts = products.map(product => ({
        shop_id: shop.id,
        product_id: product.id
      }));

      const { error: linkError } = await supabase
        .from('shop_products')
        .insert(shopProducts);

      if (linkError) throw linkError;
    }

    return {
      ...shop,
      products
    };
  },

  // Mettre à jour une boutique
  updateShop: async (id: string, shopData: Partial<Shop>): Promise<Shop> => {
    const { data: shop, error } = await supabase
      .from('shops')
      .update(shopData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return shop;
  },

  // Supprimer une boutique
  deleteShop: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};