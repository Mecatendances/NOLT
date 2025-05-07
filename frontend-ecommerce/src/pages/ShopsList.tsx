import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Store, Plus, ShoppingBag, Package } from 'lucide-react';
import { shopApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Shop } from '../types/shop';

export function ShopsList() {
  const { isAdmin } = useAuth();
  const { data: shops = [], isLoading } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: shopApi.getShops
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 animate-bounce text-nolt-orange" />
          <p className="mt-4 font-montserrat text-nolt-black">Chargement des boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-thunder text-4xl text-nolt-black">Mes Boutiques 🏪</h1>
        {isAdmin() && (
          <Link
            to="/create-shop"
            className="flex items-center gap-2 rounded-xl bg-nolt-orange px-4 py-2 font-semibold text-white transition-all hover:bg-orange-600"
          >
            <Plus className="h-5 w-5" />
            Nouvelle Boutique
          </Link>
        )}
      </div>

      {shops.length === 0 ? (
        <div className="rounded-xl bg-orange-50 p-8 text-center">
          <Store className="mx-auto h-16 w-16 text-nolt-orange" />
          <h2 className="mt-4 font-thunder text-2xl text-nolt-black">
            {isAdmin() ? "Pas encore de boutique ?" : "Aucune boutique disponible"}
          </h2>
          <p className="mt-2 text-gray-600">
            {isAdmin() 
              ? "Crée ta première boutique pour commencer à vendre tes produits !"
              : "Les boutiques seront bientôt disponibles. Revenez plus tard !"}
          </p>
          {isAdmin() && (
            <Link
              to="/create-shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-nolt-orange px-6 py-3 font-semibold text-white transition-all hover:bg-orange-600"
            >
              <Plus className="h-5 w-5" />
              Créer ma première boutique
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg"
            >
              <h3 className="font-thunder text-xl text-nolt-black">{shop.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{shop.description}</p>
              
              <div className="mt-4 flex items-center gap-4">
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <ShoppingBag className="h-4 w-4" />
                  {shop.products.length} produits
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Package className="h-4 w-4" />
                  {shop.products.reduce((total, p) => total + p.stock, 0)} articles
                </span>
              </div>

              <div className="mt-6 flex gap-2">
                <Link
                  to={`/shops/${shop.id}`}
                  className="flex-1 rounded-lg bg-nolt-orange px-4 py-2 text-center font-semibold text-white transition-all hover:bg-orange-600"
                >
                  Gérer
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}