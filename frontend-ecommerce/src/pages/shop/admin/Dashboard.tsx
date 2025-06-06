import React, { useState, useEffect } from 'react';
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
import { Switch, FormControlLabel, Snackbar, Alert } from '@mui/material';

export function ShopAdminDashboard() {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Charger la boutique pour le statut public/privé
  const { data: shop, refetch } = useQuery({
    queryKey: ['shop', id],
    queryFn: () => shopApi.getShop(id!),
    enabled: !!id
  });
  const [isPublic, setIsPublic] = useState(shop?.isPublic ?? false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shop) setIsPublic(shop.isPublic);
  }, [shop]);

  const handleTogglePublic = async () => {
    setSaving(true);
    try {
      await shopApi.updateShop(id!, { isPublic: !isPublic });
      setIsPublic(!isPublic);
      refetch();
      setSnackbarMsg(!isPublic ? 'La boutique est maintenant publique.' : 'La boutique est maintenant privée.');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };

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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-thunder" style={{color: 'var(--brand-secondary, #FFD600)'}}>Tableau de bord</h1>
        <FormControlLabel
          control={
            <Switch
              checked={isPublic}
              onChange={handleTogglePublic}
              color="primary"
              disabled={saving}
            />
          }
          label={isPublic ? "Boutique publique (visible par tous)" : "Boutique privée (non listée)"}
        />
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>

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
                  <p className="text-2xl font-thunder" style={{color: 'var(--brand-secondary, #FFD600)'}}>{stats?.ordersCount || 0}</p>
                </div>
                <ShoppingCart className="w-8 h-8" style={{color: 'var(--brand-secondary, #FFD600)'}} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-montserrat">Produits</p>
                  <p className="text-2xl font-thunder" style={{color: 'var(--brand-secondary, #FFD600)'}}>{stats?.productsCount || 0}</p>
                </div>
                <Package className="w-8 h-8" style={{color: 'var(--brand-secondary, #FFD600)'}} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-montserrat">Campagnes</p>
                  <p className="text-2xl font-thunder" style={{color: 'var(--brand-secondary, #FFD600)'}}>{stats?.campaignsCount || 0}</p>
                </div>
                <Megaphone className="w-8 h-8" style={{color: 'var(--brand-secondary, #FFD600)'}} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-montserrat">CA total</p>
                  <p className="text-2xl font-thunder" style={{color: 'var(--brand-secondary, #FFD600)'}}>{stats?.totalRevenue?.toFixed(2) || '0.00'} €</p>
                </div>
                <Store className="w-8 h-8" style={{color: 'var(--brand-secondary, #FFD600)'}} />
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
            className="rounded-lg p-6 hover:opacity-90 transition-opacity"
            style={{background: 'var(--brand-secondary, #FFD600)', color: '#fff'}}
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
    </div>
  );
} 