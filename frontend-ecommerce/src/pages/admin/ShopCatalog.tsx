import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { productApi } from '../../services/api';
import type { Product } from '../../types/shop';

interface ShopCatalogProps {
  shop: {
    id: string;
    name: string;
    description: string;
  };
}

export function ShopCatalog({ shop }: ShopCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['shop-products', shop.id],
    queryFn: () => productApi.getShopProducts(shop.id)
  });

  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(uniqueCategories);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <span className="mx-auto h-12 w-12 animate-bounce text-nolt-orange">⏳</span>
          <p className="mt-4 font-montserrat text-nolt-black">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <Link
          to="/admin/shops"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-nolt-orange"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux boutiques
        </Link>
        <h1 className="font-thunder text-4xl text-nolt-black mt-4">{shop.name}</h1>
        <p className="text-gray-600 mt-2">{shop.description}</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-nolt-orange focus:border-nolt-orange sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-nolt-orange focus:border-nolt-orange sm:text-sm rounded-md"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-nolt-yellow"
          >
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-xl bg-gray-200">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.label}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-thunder text-lg text-nolt-black">{product.label}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-nolt-orange">{product.price.toFixed(2)} €</span>
                <span className="text-sm text-gray-500">Stock: {product.stock}</span>
              </div>
              {product.category && (
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-full bg-nolt-orange/10 px-2.5 py-0.5 text-xs font-medium text-nolt-orange">
                    {product.category}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 