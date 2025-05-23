import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Store, Plus, ShoppingBag, Package } from 'lucide-react';
import { shopApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Shop } from '../../types/shop';
import { UserRole } from '../../types/userRole';

export function ShopsList() {
  const { user, hasRole } = useAuth();
  const { data: shops = [], isLoading } = useQuery<Shop[]>({
    queryKey: ['shops'],
    queryFn: shopApi.getShops
  });

  // Filtrer les boutiques en fonction du rôle
  const filteredShops = React.useMemo(() => {
    if (hasRole(UserRole.SUPERADMIN)) {
      return shops; // Les super admins voient toutes les boutiques
    } else if (hasRole(UserRole.ADMIN)) {
      return shops.filter(shop => shop.adminId === user?.id); // Les admins ne voient que leurs boutiques
    } else {
      return shops.filter(shop => user?.licenseeShops?.includes(shop.id)); // Les autres utilisateurs ne voient que les boutiques auxquelles ils sont associés
    }
  }, [shops, user, hasRole]);

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
        <h1 className="font-thunder text-4xl text-nolt-black">
          {hasRole(UserRole.SUPERADMIN) ? "Toutes les Boutiques 🏪" : "Mes Boutiques 🏪"}
        </h1>
        {hasRole(UserRole.SUPERADMIN, UserRole.ADMIN) && (
          <Link
            to="/create-shop"
            className="flex items-center gap-2 rounded-xl bg-nolt-orange px-4 py-2 font-semibold text-white transition-all hover:bg-orange-600"
          >
            <Plus className="h-5 w-5" />
            Nouvelle Boutique
          </Link>
        )}
      </div>

      {filteredShops.length === 0 ? (
        <div className="rounded-xl bg-orange-50 p-8 text-center">
          <Store className="mx-auto h-16 w-16 text-nolt-orange" />
          <h2 className="mt-4 font-thunder text-2xl text-nolt-black">
            {hasRole(UserRole.SUPERADMIN, UserRole.ADMIN) 
              ? "Pas encore de boutique ?" 
              : "Aucune boutique disponible"}
          </h2>
          <p className="mt-2 text-gray-600">
            {hasRole(UserRole.SUPERADMIN, UserRole.ADMIN)
              ? "Crée ta première boutique pour commencer à vendre tes produits !"
              : "Les boutiques seront bientôt disponibles. Revenez plus tard !"}
          </p>
          {hasRole(UserRole.SUPERADMIN, UserRole.ADMIN) && (
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredShops.map((shop) => (
            <Link
              key={shop.id}
              to={`/shops/${shop.id}`}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-nolt-yellow"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-nolt-orange/10 p-3">
                  <Store className="h-6 w-6 text-nolt-orange" />
                </div>
                <div>
                  <h3 className="font-thunder text-xl text-nolt-black">{shop.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{shop.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>{shop.products?.length || 0} produits</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{shop.orders?.length || 0} commandes</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}