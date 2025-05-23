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

  // ID de la catégorie Dolibarr cible pour cette instance de la page admin catalogue
  // À terme, cela pourrait venir d'une prop, d'un paramètre d'URL, ou d'une config utilisateur
  const targetDolibarrCategoryId = '183'; 

  // Récupérer l'entité Shop (qui contient l'UUID) basée sur le targetDolibarrCategoryId
  const { data: shopEntity, isLoading: isLoadingShopEntity, error: shopEntityError } = useQuery<Shop | null>({
    queryKey: ['shop-by-dolibarr-category', targetDolibarrCategoryId],
    queryFn: async () => {
      if (!targetDolibarrCategoryId) return null;
      try {
        return await shopApi.getShopByDolibarrCategoryId(targetDolibarrCategoryId);
      } catch (err) {
        console.error('Erreur récupération ShopEntity by Dolibarr Category ID:', err);
        setError('Impossible de lier à une boutique. Vérifiez sa configuration ou créez-la.');
        return null;
      }
    },
    enabled: !!targetDolibarrCategoryId, // Activer seulement si targetDolibarrCategoryId est défini
  });

  // L'UUID de la boutique à utiliser pour les opérations. 
  // C'est CE shopId qui doit être utilisé pour mettre à jour le webLabel custom.
  const actualShopUuid = shopEntity?.id;

  useEffect(() => {
    if (shopEntityError) {
      setError('Erreur chargement de la boutique: ' + (shopEntityError as Error).message);
    }
    if (!isLoadingShopEntity && !shopEntity && targetDolibarrCategoryId) {
      // Gérer le cas où la boutique n'existe pas encore pour ce dolibarrCategoryId
      // On pourrait afficher un message différent ou un bouton pour la créer.
      console.warn(`Aucune ShopEntity trouvée pour dolibarrCategoryId: ${targetDolibarrCategoryId}`);
      //setError(`Aucune boutique configurée pour la catégorie Dolibarr ${targetDolibarrCategoryId}. Veuillez la créer.`);
    }
  }, [shopEntity, isLoadingShopEntity, shopEntityError, targetDolibarrCategoryId]);
  
  // Pour les appels existants qui utilisaient l'ancien shopId (qui était un categoryId)
  // Nous devons décider s'ils doivent utiliser targetDolibarrCategoryId ou actualShopUuid.
  // getCategoriesFilles attendait un categoryId, donc on garde targetDolibarrCategoryId.
  const { data: fcSubcategoriesData = [], isLoading: loadingSubCat, error: subCatError } = useQuery<any[]>({
    queryKey: ['admin-fc-subcategories', targetDolibarrCategoryId], // Utilise targetDolibarrCategoryId
    queryFn: async () => {
      if (!targetDolibarrCategoryId) return [];
      try {
        return await shopApi.getCategoriesFilles(targetDolibarrCategoryId);
      } catch (err) {
        console.error('Erreur lors de la récupération des sous-catégories:', err);
        setError('Impossible de charger les catégories. Veuillez réessayer.');
        return [];
      }
    },
    enabled: !!targetDolibarrCategoryId, // Activer si targetDolibarrCategoryId est là
  });

  const fcSubCategories: CategoryTree[] = useMemo(() => (
    fcSubcategoriesData.map(sc => ({ id: String(sc.id), label: sc.label }))
  ), [fcSubcategoriesData]);

  // getProducts peut maintenant prendre un shopId (UUID) pour charger les webLabels customisés
  const { data: products = [], isLoading: loadingProd } = useQuery<Product[]>({
    queryKey: ['admin-fc-products', fcSubCategories.map(c=>c.id).join(','), actualShopUuid], // Ajout de actualShopUuid à la clé
    enabled: fcSubCategories.length > 0 && !!actualShopUuid, // S'assurer que shop UUID est là aussi
    queryFn: async () => {
      if (!actualShopUuid) return []; // Ne pas fetcher si on n'a pas l'UUID du shop
      const all = await Promise.all(fcSubCategories.map(async sub => {
        // Ici, getProducts prend le categoryId (sub.id) ET le shopId (actualShopUuid)
        const prods = await shopApi.getProducts({ category: sub.id, shopId: actualShopUuid }); 
        return prods.map(p => ({ ...p, subCategoryIds: [...(p.subCategoryIds ?? []), sub.id] }));
      }));
      return all.flat();
    }
  });
  
  const loadingCat = loadingSubCat || isLoadingShopEntity; // isLoadingShopEntity est important ici

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

  // Gestion de l'état d'erreur combiné
  useEffect(() => {
    if (subCatError) {
        setError('Impossible de charger les catégories. Veuillez réessayer.');
    }
    // L'erreur pour shopEntity est déjà gérée dans son propre useEffect
  }, [subCatError]);
  
  const combinedError = error; // Utiliser l'état d'erreur local qui est mis à jour par les différentes requêtes

  if (combinedError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 font-montserrat text-red-500">{combinedError}</p>
          <button
            onClick={() => window.location.reload()} // ou une logique de refetch plus ciblée
            className="mt-4 px-4 py-2 bg-nolt-orange text-white rounded-lg hover:bg-nolt-yellow"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (loadingProd || loadingCat || isLoadingShopEntity) {
    return (
      <div className="flex h-96 items-center justify-center text-nolt-orange font-montserrat">Chargement…</div>
    );
  }
  
  return (
    <div className="p-6 space-y-8">
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

      {filteredProducts.length === 0 && !isLoadingShopEntity && !loadingCat && !loadingProd ? (
        <p className="text-center text-gray-500 font-montserrat">
          {actualShopUuid ? 'Aucun produit pour cette catégorie.' : `Boutique non trouvée pour la catégorie Dolibarr ${targetDolibarrCategoryId}. Veuillez la créer ou vérifier la configuration.`}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(prod => {
            console.log('Affichage Produit:', { id: prod.id, label: prod.label, webLabel: prod.webLabel });
            const displayLabel = prod.webLabel;
            const originalLabelDolibarr = prod.label;
            const showOriginalLabelInParentheses = prod.webLabel !== originalLabelDolibarr;

            return (
              <div key={prod.id} className="relative border rounded-lg p-4 bg-white hover:shadow">
                <button
                  onClick={() => setPopupProduct(prod)}
                  disabled={!actualShopUuid} // Désactiver si pas d'UUID de boutique
                  className="absolute top-2 right-2 p-1 bg-nolt-orange/90 rounded text-white hover:bg-nolt-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={prod.images && prod.images.length > 0 ? prod.images[0] : '/placeholder.png'}
                    alt={prod.webLabel || prod.label}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <h3 className="mt-4 font-thunder text-lg text-nolt-black">
                  <>
                    <span className={showOriginalLabelInParentheses ? "text-nolt-orange" : ""}>
                      {displayLabel}
                    </span>
                    {showOriginalLabelInParentheses && (
                      <span className="text-sm text-gray-500 ml-2">({originalLabelDolibarr})</span>
                    )}
                  </>
                </h3>
                <p className="text-sm text-gray-500 font-montserrat">Réf : {prod.ref}</p>
                <p className="font-thunder text-nolt-orange mt-2">{prod.price.toFixed(2)} €</p>
                <p className="text-xs text-gray-500 font-montserrat">Stock : {prod.stock}</p>
              </div>
            );
          })}
        </div>
      )}

      {popupProduct && actualShopUuid && (
        <AdminProductDetailPopup
          product={popupProduct}
          shopId={actualShopUuid} // Utilisation de l'UUID ici
          isOpen={true}
          onClose={() => setPopupProduct(null)}
        />
      )}
    </div>
  );
} 