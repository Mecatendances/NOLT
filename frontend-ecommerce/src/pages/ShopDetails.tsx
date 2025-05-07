import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Store, ArrowLeft, Package, Euro } from 'lucide-react';
import { shopApi } from '../services/api';
import { ProductList } from '../components/ProductList';
import type { Shop } from '../types/shop';

export function ShopDetails() {
  const { id } = useParams<{ id: string }>();
  
  const { data: shop, isLoading, error } = useQuery<Shop>({
    queryKey: ['shop', id],
    queryFn: () => shopApi.getShop(Number(id)),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 animate-bounce text-nolt-orange" />
          <p className="mt-4 font-montserrat text-nolt-black">Chargement de la boutique...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl bg-red-50 p-8 text-center">
          <h2 className="font-thunder text-2xl text-red-600">
            Oups ! Impossible de charger la boutique
          </h2>
          <p className="mt-2 text-red-600">
            La boutique n'existe pas ou une erreur s'est produite.
          </p>
          <Link
            to="/shops"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-nolt-orange px-6 py-3 font-semibold text-white transition-all hover:bg-orange-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour aux boutiques
          </Link>
        </div>
      </div>
    );
  }

  const totalStock = shop.products.reduce((total, p) => total + p.stock, 0);
  const totalValue = shop.products.reduce((total, p) => total + (p.price * p.stock), 0);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <Link
          to="/shops"
          className="inline-flex items-center gap-2 text-nolt-orange hover:text-orange-600"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour aux boutiques
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="font-thunder text-4xl text-nolt-black">{shop.name}</h1>
        <p className="mt-2 text-gray-600">{shop.description}</p>
      </div>

      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-orange-50 p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-nolt-orange text-white">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="font-thunder text-xl text-nolt-black">Stock Total</h3>
          <p className="mt-2 text-2xl font-bold text-nolt-orange">{totalStock} articles</p>
        </div>

        <div className="rounded-xl bg-orange-50 p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-nolt-orange text-white">
            <Euro className="h-6 w-6" />
          </div>
          <h3 className="font-thunder text-xl text-nolt-black">Valeur du Stock</h3>
          <p className="mt-2 text-2xl font-bold text-nolt-orange">{totalValue.toFixed(2)}€</p>
        </div>
      </div>

      <div>
        <h2 className="mb-6 font-thunder text-2xl text-nolt-black">Produits de la boutique</h2>
        <ProductList products={shop.products} onProductSelect={() => {}} />
      </div>
    </div>
  );
}