import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shopApi } from '../../../services/api';
import {
  Package,
  Store,
  Search,
  Megaphone,
  ShoppingCart,
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import type { Product } from '../../../types/shop';

export default function ShopAdminDashboard() {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Statistiques de la boutique
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['shop-admin-stats', id],
    queryFn: () => shopApi.getShopAdminStats(id!),
    enabled: !!id
  });

  // Produits de la boutique
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products', id],
    queryFn: () => shopApi.getProducts({ shopId: id }),
    enabled: !!id
  });

  const filteredProducts = products.filter(product =>
    product.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Actions rapides (adaptées à l'admin local)
  const quickActions = [
    { name: 'Nouveau produit', icon: Plus, href: `/shops/${id}/admin/products/new`, color: 'bg-nolt-orange' },
    { name: 'Nouvelle campagne', icon: Megaphone, href: `/shops/${id}/admin/campaigns/new`, color: 'bg-nolt-yellow' },
  ];

  // Items récents (adaptés à l'admin local)
  const recentItems = [
    {
      name: 'Commandes récentes',
      icon: ShoppingCart,
      href: `/shops/${id}/admin/orders`,
      color: 'text-nolt-orange',
    },
    {
      name: 'Produits',
      icon: Package,
      href: `/shops/${id}/admin/products`,
      color: 'text-blue-500',
    },
    {
      name: 'Campagnes',
      icon: Megaphone,
      href: `/shops/${id}/admin/campaigns`,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-thunder text-nolt-orange">Tableau de bord</h1>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoadingStats ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-montserrat">Commandes</p>
                  <p className="text-2xl font-thunder text-nolt-orange">{stats?.ordersCount || 0}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-nolt-orange" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-montserrat">Produits</p>
                  <p className="text-2xl font-thunder text-nolt-orange">{stats?.productsCount || 0}</p>
                </div>
                <Package className="w-8 h-8 text-nolt-orange" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-montserrat">Campagnes</p>
                  <p className="text-2xl font-thunder text-nolt-orange">{stats?.campaignsCount || 0}</p>
                </div>
                <Megaphone className="w-8 h-8 text-nolt-orange" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-montserrat">CA total</p>
                  <p className="text-2xl font-thunder text-nolt-orange">{stats?.totalRevenue?.toFixed(2) || '0.00'} €</p>
                </div>
                <Store className="w-8 h-8 text-nolt-orange" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            to={action.href}
            className={`${action.color} text-white rounded-lg p-6 hover:opacity-90 transition-opacity`}
          >
            <div className="flex items-center space-x-4">
              <action.icon className="w-8 h-8" />
              <span className="font-montserrat">{action.name}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Items récents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <item.icon className={`w-8 h-8 ${item.color}`} />
              <span className="font-montserrat text-gray-700">{item.name}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Produits de la boutique */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-thunder text-nolt-orange">Produits de la boutique</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-10 border rounded-lg font-montserrat"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          {isLoadingProducts ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8 font-montserrat">
              Aucun produit trouvé
            </p>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.label}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-thunder text-lg text-nolt-black">{product.label}</h3>
                    <p className="text-gray-500 font-montserrat">{product.ref}</p>
                  </div>
                  <div className="font-thunder text-nolt-yellow text-xl">{product.price?.toFixed(2)}€</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 