import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ShopForm } from '../../components/ShopForm';
import { ProductList } from '../../components/ProductList';
import { Store } from 'lucide-react';
import { shopApi } from '../../services/api';
import type { Product } from '../../types/shop';

export function CreateShop() {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Utiliser shopApi.getProducts() pour récupérer les produits
  const { data: products = [], isLoading: isLoadingProducts, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => shopApi.getProducts(),
    retry: 3 // Réessayer 3 fois en cas d'échec
  });

  // Filtrer les produits pour ne garder que ceux de la catégorie 'FC Chalon'
  const filteredProducts = products.filter(p => p.category.includes('FC Chalon'));

  const createShopMutation = useMutation({
    mutationFn: shopApi.createShop,
    onSuccess: () => {
      navigate('/admin/shops');
    }
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleSubmit = async (data: unknown) => {
    try {
      if (typeof data === 'object' && data !== null) {
        await createShopMutation.mutateAsync({
          ...data,
          products: selectedProducts
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de la boutique:', error);
    }
  };

  if (isLoadingProducts) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 animate-bounce text-nolt-orange" />
          <p className="mt-4 font-montserrat text-nolt-black">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl bg-red-50 p-8 text-center">
          <h2 className="font-thunder text-2xl text-red-600 mb-4">
            Oups ! Impossible de charger les produits
          </h2>
          <p className="text-red-600 mb-6">
            Une erreur est survenue lors du chargement des produits. Veuillez réessayer plus tard.
          </p>
          <button
            onClick={() => navigate('/admin/shops')}
            className="inline-flex items-center gap-2 bg-nolt-orange text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
          >
            Retour aux boutiques
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-thunder text-4xl text-nolt-black">Créer une nouvelle boutique 🏪</h1>
      
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-thunder text-2xl text-nolt-black">Informations de la boutique</h2>
          <div className="mt-4">
            <ShopForm onSubmit={handleSubmit} />
          </div>
        </div>

        <div>
          <h2 className="font-thunder text-2xl text-nolt-black">Sélectionner les produits</h2>
          <p className="mt-2 text-gray-600">
            Choisis les produits qui seront disponibles dans ta boutique
          </p>
          <div className="mt-4">
            <ProductList
              products={filteredProducts}
              onProductSelect={handleProductSelect}
              selectedProducts={selectedProducts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}