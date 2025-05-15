// Fichier minimal pour permettre au routing de fonctionner
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Store, 
  Plus, 
  Search, 
  Package, 
  Grid, 
  List,
  Image as ImageIcon,
  ShoppingBag,
  Eye
} from 'lucide-react';
import { shopApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Shop } from '../../types/shop';
import { UserRole } from '../../types/userRole';

export function ShopsList() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const { data: shops = [], isLoading } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: shopApi.getShops
  });

  useEffect(() => {
    if (!isLoading && hasRole(UserRole.ADMIN) && !hasRole(UserRole.SUPERADMIN)) {
      // Trouver la boutique de l'admin
      const myShop = shops.find(shop => shop.adminId === user?.id);
      if (myShop) {
        navigate(`/admin/shops/${myShop.id}/products`, { replace: true });
      }
    }
  }, [isLoading, shops, user, hasRole, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <span className="mx-auto h-12 w-12 animate-bounce text-nolt-orange">⏳</span>
          <p className="mt-4 font-montserrat text-nolt-black">Chargement...</p>
        </div>
      </div>
    );
  }

  // Superadmin : liste des boutiques
  if (hasRole(UserRole.SUPERADMIN)) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-thunder text-4xl text-nolt-black mb-8">Toutes les Boutiques 🏪</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-nolt-yellow"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-nolt-orange/10 p-3">
                  <span className="h-6 w-6 text-nolt-orange">🏪</span>
                </div>
                <div>
                  <h3 className="font-thunder text-xl text-nolt-black">{shop.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{shop.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>📦</span>
                  <span>{shop.products?.length || 0} produits</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🛒</span>
                  <span>{shop.orders?.length || 0} commandes</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <a
                  href={`/admin/shops/${shop.id}/products`}
                  className="inline-flex items-center gap-2 rounded-lg bg-nolt-yellow px-4 py-2 font-semibold text-nolt-black hover:bg-nolt-orange hover:text-white transition-all"
                >
                  👁️ Voir les produits
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si pas superadmin, rien à afficher (redirection automatique)
  return null;
}