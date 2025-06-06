import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Image, Edit2, AlertCircle } from 'lucide-react';
import { shopApi } from '../../../services/api';
import type { Product, Shop } from '../../../types/shop';

interface DisplayCategory {
  id: string;
  name: string;
  subcategoryId?: string;
  count: number;
}

export function Catalog() {
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [subcategories, setSubcategories] = useState<{id: string, label: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [popupProduct, setPopupProduct] = useState<Product | null>(null);

  // Charger la boutique courante
  const { data: shop, isLoading: isLoadingShop } = useQuery<Shop>({
    queryKey: ['shop', id],
    queryFn: () => shopApi.getShop(id!),
    enabled: !!id,
  });

  // Charger les sous-catégories comme dans l'admin global
  useEffect(() => {
    if (!shop?.dolibarrCategoryId) return;
    setIsLoadingCategory(true);
    setError(null);
    // 1. Charger toutes les catégories pour trouver la racine
    fetch('/api/catalog/categories')
      .then(res => res.json())
      .then((allCategories) => {
        const racine = allCategories.find((cat) => cat.dolibarrId === shop.dolibarrCategoryId);
        if (!racine) {
          setSubcategories([]);
          setIsLoadingCategory(false);
          setError('Catégorie racine non trouvée');
          return;
        }
        // 2. Charger les sous-catégories de la racine
        fetch(`/api/catalog/categories?parent=${racine.id}`)
          .then(res => res.json())
          .then((subcats) => {
            const subCategories = subcats.map((cat) => ({ id: String(cat.id), label: cat.label }));
            setSubcategories(subCategories);
            setIsLoadingCategory(false);
          });
      })
      .catch((err) => {
        setError('Erreur lors du chargement des catégories');
        setSubcategories([]);
        setIsLoadingCategory(false);
      });
  }, [shop?.dolibarrCategoryId]);

  // Générer dynamiquement les catégories d'affichage
  const categories = useMemo<DisplayCategory[]>(() => {
    const dynamicCategories: DisplayCategory[] = [
      { id: 'all', name: 'Tous les produits', count: 0 }
    ];
    subcategories.forEach(subcat => {
      const id = subcat.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
      dynamicCategories.push({
        id,
        name: subcat.label,
        count: 0,
        subcategoryId: subcat.id
      });
    });
    return dynamicCategories;
  }, [subcategories]);

  // Charger tous les produits de la boutique pour les compteurs
  const { data: allProducts = [], isLoading: isLoadingAllProducts } = useQuery<Product[]>({
    queryKey: ['shop-products-all', id],
    queryFn: () => shopApi.getProducts({ shopId: id }),
    enabled: !!id && !isLoadingCategory && subcategories.length > 0
  });

  // Calculer le nombre de produits pour chaque catégorie dès le chargement
  const categoriesWithCounts = useMemo(() => {
    if (!allProducts || subcategories.length === 0) return categories;
    // Compter pour chaque sous-catégorie
    const counts: Record<string, number> = {};
    subcategories.forEach(subcat => {
      counts[subcat.id] = allProducts.filter(
        p => Array.isArray(p.categories) && p.categories.some(cat => String(cat.id) === String(subcat.id))
      ).length;
    });
    // Catégorie "Tous les produits" toujours le total
    const allCount = allProducts.length;
    return categories.map(cat => {
      if (cat.id === 'all') return { ...cat, count: allCount };
      if (cat.subcategoryId) return { ...cat, count: counts[cat.subcategoryId] || 0 };
      return cat;
    });
  }, [categories, allProducts, subcategories]);

  // Filtrage des produits selon la catégorie sélectionnée
  const filteredProducts = useMemo(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      const subcat = subcategories.find(s => {
        const catId = s.id.toString();
        return (
          selectedCategory === s.label.toLowerCase().replace(/[^a-z0-9]/g, '_') ||
          selectedCategory === catId
        );
      });
      if (subcat) {
        return allProducts.filter(
          p => Array.isArray(p.categories) && p.categories.some(cat => String(cat.id) === String(subcat.id))
        );
      }
      return [];
    }
    return allProducts;
  }, [selectedCategory, allProducts, subcategories]);

  if (isLoadingShop || isLoadingCategory || isLoadingAllProducts) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 animate-bounce text-nolt-yellow" />
          <p className="mt-4 font-montserrat text-nolt-black">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 font-montserrat text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 font-montserrat text-red-500">Boutique non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8" id="product-grid">
        {/* Sidebar catégories */}
        <div className="lg:w-64 bg-white">
          <div className="sticky top-20">
            <div className="border-b pb-6 mb-6 bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-thunder italic uppercase text-nolt-black mb-4">Catégories</h2>
              <ul className="space-y-1">
                {categoriesWithCounts.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center justify-between w-full text-left font-montserrat rounded-lg px-3 py-2 transition-all
                        ${selectedCategory === category.id
                          ? 'bg-nolt-orange text-white font-bold shadow'
                          : 'text-gray-500 hover:bg-nolt-yellow hover:text-nolt-black'}
                      `}
                    >
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-300 font-normal">({category.count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Grille produits */}
        <div className="flex-1">
          <p className="mb-8 text-gray-500 font-montserrat">
            {filteredProducts.length} produits disponibles
          </p>
          <div className="transition-opacity opacity-100">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-thunder italic uppercase text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="mt-2 text-gray-500 font-montserrat">
                  Essayez de modifier vos filtres ou sélectionnez une autre catégorie.
                </p>
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className="mt-4 text-nolt-orange hover:text-nolt-yellow transition-colors font-montserrat"
                >
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="group border border-gray-200 transition-all duration-300 rounded-lg overflow-hidden flex flex-col bg-white"
                    style={{borderColor: 'var(--brand-secondary, #FFD600)'}}
                  >
                    <div 
                      className="w-full relative cursor-pointer"
                      onClick={() => setPopupProduct(product)}
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.webLabel || product.label}
                          className="w-full aspect-square object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                          <Image className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-5 flex flex-col">
                      <h3 
                        className="font-thunder text-xl uppercase text-nolt-black group-hover:text-nolt-orange transition-colors leading-tight cursor-pointer"
                        onClick={() => setPopupProduct(product)}
                      >
                        {product.webLabel || product.label}
                      </h3>
                      <p className="text-gray-500 text-xs mb-2">{product.ref}</p>
                      <p className="text-gray-700 text-sm mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-2 mt-auto">
                        <span className="font-thunder text-nolt-yellow text-lg">{product.price?.toFixed(2)}€</span>
                        <span className="text-gray-400 text-xs">Stock: {product.stock}</span>
                      </div>
                      <button
                        className="mt-4 px-4 py-2 rounded-lg bg-nolt-orange text-white font-montserrat hover:bg-nolt-yellow hover:text-nolt-black transition-colors"
                        onClick={() => setPopupProduct(product)}
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 