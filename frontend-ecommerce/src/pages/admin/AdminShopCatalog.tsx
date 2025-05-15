import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, ChevronUp, Image, Edit2 } from 'lucide-react';
import { shopApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Product, CategoryTree } from '../../types/shop';
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

  // ID de la boutique (licencié) – fallback 183
  const shopId = user?.licenseeShops?.[0] ?? '183';

  /* -------- récupérer sous-catégories via endpoint categoriesFilles ------ */
  const { data: fcSubcategoriesData = [], isLoading: loadingSubCat } = useQuery<any[]>({
    queryKey: ['admin-fc-subcategories', shopId],
    queryFn: () => shopApi.getCategoriesFilles(shopId)
  });

  // Map vers CategoryTree minimal
  const fcSubCategories: CategoryTree[] = useMemo(() => (
    fcSubcategoriesData.map(sc => ({ id: String(sc.id), label: sc.label }))
  ), [fcSubcategoriesData]);

  /* -------- récupérer produits de chaque sous-catégorie -------- */
  const { data: products = [], isLoading: loadingProd } = useQuery<Product[]>({
    queryKey: ['admin-fc-products', fcSubCategories.map(c=>c.id).join(',')],
    enabled: fcSubCategories.length > 0,
    queryFn: async () => {
      const all = await Promise.all(fcSubCategories.map(async sub => {
        const prods = await shopApi.getProducts({ category: sub.id });
        return prods.map(p => ({ ...p, subCategoryIds: [...(p.subCategoryIds ?? []), sub.id] }));
      }));
      return all.flat();
    }
  });

  const loadingCat = loadingSubCat;

  /* -------------------- construire set ids ----------------- */
  const fcCategoryIds: Set<string> = useMemo(() => {
    const ids = new Set<string>();
    const walk = (cat?: CategoryTree) => {
      if (!cat) return;
      ids.add(cat.id);
      cat.children?.forEach(walk);
    };
    fcSubCategories.forEach(walk);
    return ids;
  }, [fcSubCategories]);

  // Ne garder que les produits appartenant aux sous-catégories ou à la catégorie racine
  const fcProducts = useMemo(() => {
    return products.filter(p => {
      if (p.category && fcCategoryIds.has(p.category)) return true;
      if (p.subCategoryIds?.some(id => fcCategoryIds.has(id))) return true;
      return false;
    });
  }, [products, fcCategoryIds]);

  /* ------------------ catégories d'affichage -------------- */
  const categories: DisplayCategory[] = useMemo(() => {
    const result: DisplayCategory[] = [{ id: 'all', name: 'Tous', count: fcProducts.length }];
    fcSubCategories.forEach(sub => {
      const count = fcProducts.filter(p =>
        p.subCategoryIds?.includes(sub.id) || p.category === sub.id
      ).length;
      result.push({ id: sub.id, name: sub.label, subcategoryId: sub.id, count });
    });
    return result;
  }, [fcSubCategories, fcProducts]);

  /* ------------------ filtrage produits ------------------- */
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return fcProducts;
    console.log('Produits filtrés:', fcProducts);
    return fcProducts.filter(p =>
      p.category === selectedCategory || p.subCategoryIds?.includes(selectedCategory)
    );
  }, [selectedCategory, fcProducts]);

  const [popupProduct, setPopupProduct] = useState<Product | null>(null);

  // Log pour déboguer
  useEffect(() => {
    console.log('Produits FC:', fcProducts);
  }, [fcProducts]);

  if (loadingProd || loadingCat) {
    return (
      <div className="flex h-96 items-center justify-center text-nolt-orange font-montserrat">Chargement…</div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Filtre catégories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-montserrat text-sm transition-colors ${
              selectedCategory === cat.id
                ? 'bg-nolt-orange text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Grille produits */}
      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 font-montserrat">Aucun produit pour cette catégorie.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(prod => (
            <div key={prod.id} className="relative border rounded-lg p-4 bg-white hover:shadow">
              {/* bouton détails */}
              <button
                onClick={() => setPopupProduct(prod)}
                className="absolute top-2 right-2 p-1 bg-nolt-orange/90 rounded text-white hover:bg-nolt-yellow"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={prod.imageUrl || '/placeholder.png'}
                  alt={prod.webLabel || prod.label}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <h3 className="mt-4 font-thunder text-lg text-nolt-black">
                {prod.webLabel ? (
                  <>
                    <span className="text-nolt-orange">{prod.webLabel}</span>
                    <span className="text-sm text-gray-500 ml-2">({prod.label})</span>
                  </>
                ) : (
                  prod.label
                )}
              </h3>
              <p className="text-sm text-gray-500 font-montserrat">Réf : {prod.ref}</p>
              <p className="font-thunder text-nolt-orange mt-2">{prod.price.toFixed(2)} €</p>
              <p className="text-xs text-gray-500 font-montserrat">Stock : {prod.stock}</p>
            </div>
          ))}
        </div>
      )}

      {/* Popup détail produit */}
      {popupProduct && (
        <AdminProductDetailPopup
          product={popupProduct}
          shopId={shopId}
          isOpen={true}
          onClose={() => setPopupProduct(null)}
        />
      )}
    </div>
  );
} 