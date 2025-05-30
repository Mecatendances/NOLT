import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, ChevronUp, Image, Edit2, AlertCircle } from 'lucide-react';
import { shopApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Product, CategoryTree, Shop } from '../../types/shop';
import { AdminProductDetailPopup } from '../../components/admin/AdminProductDetailPopup';

interface DisplayCategory {
  id: string;
  name: string;
  subcategoryId?: string;
  count: number;
}

export function AdminShopCatalog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [fcChalonSubcategories, setFcChalonSubcategories] = useState<{id: string, label: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [popupProduct, setPopupProduct] = useState<Product | null>(null);

  // 1. Charger toutes les catégories et trouver la racine FC Chalon
  useEffect(() => {
    setIsLoadingCategory(true);
    setError(null);
    shopApi.getCategories().then((categories) => {
      // On suppose que getCategories retourne toutes les catégories avec dolibarrId
      fetch('http://localhost:4000/api/catalog/categories')
        .then(res => res.json())
        .then(async (allCategories) => {
          const racine = allCategories.find((cat: any) => cat.dolibarrId === 183);
          if (!racine) {
            setFcChalonSubcategories([]);
            setIsLoadingCategory(false);
            setError('Catégorie racine non trouvée');
            return;
          }
          // 2. Charger les sous-catégories de la racine
          fetch(`http://localhost:4000/api/catalog/categories?parent=${racine.id}`)
            .then(res => res.json())
            .then(async (subcats) => {
              const subCategories = subcats.map((cat: any) => ({ id: String(cat.id), label: cat.label }));
              setFcChalonSubcategories(subCategories);
              setIsLoadingCategory(false);
            });
        });
    });
  }, []);

  // Générer dynamiquement les catégories d'affichage à partir des sous-catégories
  const categories = useMemo<DisplayCategory[]>(() => {
    const dynamicCategories: DisplayCategory[] = [
      { id: 'all', name: 'Tous les produits', count: 0 }
    ];
    fcChalonSubcategories.forEach(subcat => {
      const id = subcat.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
      dynamicCategories.push({
        id,
        name: subcat.label,
        count: 0,
        subcategoryId: subcat.id
      });
    });
    return dynamicCategories;
  }, [fcChalonSubcategories]);

  // Récupérer les produits de la catégorie sélectionnée ou tous les produits
  const { data: selectedCategoryProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['admin-products-fc-chalon', selectedCategory],
    queryFn: async () => {
      const selectedCatObj = categories.find(cat => cat.id === selectedCategory);
      if (selectedCategory && selectedCategory !== 'all' && selectedCatObj?.subcategoryId) {
        return shopApi.getProducts({ category: selectedCatObj.subcategoryId });
      }
      const allProductsPromises = fcChalonSubcategories.map(
        subcat => shopApi.getProducts({ category: subcat.id })
      );
      const results = await Promise.all(allProductsPromises);
      return results.flat();
    },
    enabled: !isLoadingCategory
  });

  // Mettre à jour le compteur de produits pour chaque catégorie
  useEffect(() => {
    if (selectedCategoryProducts.length > 0) {
      const selectedCat = categories.find(cat => cat.id === selectedCategory);
      if (selectedCat) {
        const updatedCategories = categories.map(cat => {
          if (cat.id === selectedCategory) {
            return { ...cat, count: selectedCategoryProducts.length };
          }
          return cat;
        });
        categories.splice(0, categories.length, ...updatedCategories);
      }
    }
  }, [selectedCategoryProducts, selectedCategory]);

  const filteredProducts = selectedCategoryProducts;

  if (isLoading || isLoadingCategory) {
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
    return <div>Erreur lors du chargement des sous-catégories.</div>;
  }
  if (!isLoadingCategory && fcChalonSubcategories && fcChalonSubcategories.length === 0) {
    return <div>Aucune sous-catégorie trouvée.</div>;
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
                {categories.map((category) => (
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
                    className="group border border-gray-200 hover:border-nolt-yellow transition-all duration-300 rounded-lg overflow-hidden flex flex-col bg-white"
                  >
                    <div 
                      className="w-full relative cursor-pointer"
                      onClick={() => setPopupProduct(product)}
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
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
                        {product.label}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 font-montserrat">{product.ref}</p>
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-3 font-montserrat line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex justify-between items-end mt-5">
                        <p className="text-2xl font-thunder italic text-nolt-yellow">
                          {typeof product.price === 'number' ? product.price.toFixed(2) : '—'}€
                        </p>
                        <button 
                          onClick={() => setPopupProduct(product)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:border-nolt-yellow hover:text-nolt-yellow transition-colors font-montserrat"
                        >
                          Modifier
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup admin pour édition produit */}
      {popupProduct && (
        <AdminProductDetailPopup
          product={popupProduct}
          shopId={''}
          isOpen={true}
          onClose={() => setPopupProduct(null)}
        />
      )}
    </div>
  );
} 