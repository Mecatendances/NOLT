import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../../services/api';
import { Package, Image, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { Product, CategoryTree } from '../../types/shop';

export function ShopProducts() {
  const { shopId } = useParams<{ shopId: string }>();
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editedProducts, setEditedProducts] = useState<Record<string, Partial<Product>>>({});
  const [webLabels, setWebLabels] = useState<Record<string, string>>({});
  
  // ID de la catégorie racine pour FC Chalon (à adapter selon votre structure)
  const FC_CHALON_CATEGORY_ID = '182';

  const { data: shop, isLoading: isLoadingShop } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => shopApi.getShop(shopId!),
    enabled: !!shopId,
  });

  const { data: allCategories = [], isLoading: isLoadingCategories } = useQuery<CategoryTree[]>({
    queryKey: ['categories'],
    queryFn: shopApi.getCategoryTree,
  });

  // Filtrer les catégories pour ne garder que celles liées à FC Chalon
  const categories = React.useMemo(() => {
    // Fonction récursive pour trouver une catégorie par ID
    const findCategoryById = (catId: string, cats: CategoryTree[]): CategoryTree | null => {
      for (const cat of cats) {
        if (cat.id === catId) return cat;
        if (cat.children && cat.children.length > 0) {
          const found = findCategoryById(catId, cat.children);
          if (found) return found;
        }
      }
      return null;
    };

    // Trouver la catégorie FC Chalon
    const fcChalonCategory = findCategoryById(FC_CHALON_CATEGORY_ID, allCategories);
    
    // Si trouvée, retourner cette catégorie seule
    if (fcChalonCategory) {
      return [fcChalonCategory];
    }
    
    return [];
  }, [allCategories]);

  // Au chargement initial, ouvrir automatiquement la catégorie FC Chalon
  useEffect(() => {
    if (categories.length > 0) {
      setExpandedCategories(prev => {
        const next = new Set(prev);
        next.add(FC_CHALON_CATEGORY_ID);
        return next;
      });
    }
  }, [categories]);

  /* ---------- ouvrir automatiquement depuis le hash --------- */
  useEffect(() => {
    if (!shop) return;
    const hash = location.hash?.replace('#', '');
    if (!hash) return;
    const pid = Number(hash);
    if (!pid) return;

    const prod = shop.products.find(p => p.id === pid);
    if (!prod) return;

    // ouvrir la catégorie correspondante
    setExpandedCategories(prev => new Set(prev).add(prod.category ?? ''));
    // mettre en édition
    setEditingProduct(String(pid));
  }, [location.hash, shop]);

  const queryClient = useQueryClient();
  const updateWebLabelMutation = useMutation({
    mutationFn: async ({ productId, value }: { productId: number, value: string }) => {
      await shopApi.updateProduct(shopId!, productId, { webLabel: value });
    },
    onSuccess: () => {
      if (shopId) queryClient.invalidateQueries({ queryKey: ['shop', shopId] });
    }
  });

  // Lors du chargement initial, charger les webLabels depuis la BDD
  useEffect(() => {
    if (shop?.products) {
      const labels: Record<string, string> = {};
      shop.products.forEach(product => {
        // product.webLabel ici est celui envoyé par le backend.
        // Il contient déjà le customWebLabel ou le fallback au label principal Dolibarr.
        labels[product.id] = product.webLabel || product.label; // Assurer un fallback si product.webLabel est vide/null
      });
      setWebLabels(labels);
    }
  }, [shop?.products]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const startEditing = (productId: number) => {
    setEditingProduct(String(productId));
    const product = shop?.products.find(p => p.id === productId);
    if (product) {
      setEditedProducts(prev => ({
        ...prev,
        [productId]: { ...product }
      }));
    }
  };

  const cancelEditing = (productId: number) => {
    setEditingProduct(null);
    setEditedProducts(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const saveProduct = async (productId: number) => {
    try {
      const updatedProduct = editedProducts[productId];
      if (updatedProduct) {
        await shopApi.updateProduct(shopId!, productId, updatedProduct);
        setEditingProduct(null);
        setEditedProducts(prev => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit', error);
    }
  };

  const handleImageUpload = async (productId: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      await shopApi.uploadProductImage(productId, formData);
      // Rafraîchir les données du produit après l'upload
      if (shopId) {
        queryClient.invalidateQueries({ queryKey: ['shop', shopId] });
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image', error);
    }
  };

  const saveWebLabel = (productId: number, value: string) => {
    updateWebLabelMutation.mutate({ productId, value });
    setEditingProduct(null);
  };

  if (isLoadingShop || isLoadingCategories) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 animate-bounce text-nolt-orange" />
          <p className="mt-4 font-montserrat text-nolt-black">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  // Fonction pour trouver tous les produits d'une catégorie et de ses sous-catégories
  const getProductsInCategoryTree = (category: CategoryTree): Product[] => {
    // Filtrer les produits qui appartiennent directement à cette catégorie
    const directProducts = shop?.products.filter(p => p.category === category.id) || [];
    
    // Récupérer récursivement les produits des sous-catégories
    const childProducts = category.children?.flatMap(child => 
      getProductsInCategoryTree(child)
    ) || [];
    
    // Combiner les produits directs et ceux des sous-catégories
    return [...directProducts, ...childProducts];
  };

  const renderCategory = (category: CategoryTree, depth = 0) => {
    // Pour la catégorie racine (FC Chalon), ne pas afficher le conteneur
    if (depth === 0 && category.id === FC_CHALON_CATEGORY_ID) {
      return (
        <div key={category.id}>
          {/* Afficher directement les sous-catégories sans le container de la catégorie racine */}
          <div className="space-y-4">
            {category.children?.map(child => renderCategory(child, 0))}
          </div>
        </div>
      );
    }
    
    const products = getProductsInCategoryTree(category);
    const isExpanded = expandedCategories.has(category.id);
    const hasProducts = products.length > 0;
    const hasChildren = category.children && category.children.length > 0;
    
    return (
      <div key={category.id} className={`mb-4 ${depth > 0 ? 'ml-4' : ''}`}>
        <button
          onClick={() => toggleCategory(category.id)}
          className={`flex w-full items-center justify-between rounded-lg p-4 hover:bg-gray-100 ${
            depth === 0 ? 'bg-gray-50 font-thunder text-lg' : 'bg-gray-100/50 font-montserrat text-base'
          }`}
        >
          <span className="text-nolt-black">{category.label}</span>
          <div className="flex items-center">
            {(hasProducts || hasChildren) && (
              <span className="mr-2 text-xs text-gray-500 font-montserrat">
                {products.length} produit{products.length !== 1 ? 's' : ''}
              </span>
            )}
            {(hasProducts || hasChildren) && (
              isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-3">
            {/* Afficher les produits de cette catégorie */}
            {products.length > 0 && (
              <div className="space-y-2">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                  >
                    {editingProduct === String(product.id) ? (
                      <div className="flex w-full items-center gap-4">
                        <div className="flex-1">
                          <div className="mb-2">
                            <span className="text-xs text-gray-400">Nom Dolibarr :</span>
                            <div className="font-mono text-gray-500 bg-gray-50 rounded px-2 py-1 text-xs">{product.label}</div>
                          </div>
                          <input
                            type="text"
                            value={webLabels[product.id] || ''}
                            onChange={e => setWebLabels(prev => ({ ...prev, [product.id]: e.target.value }))}
                            placeholder="Nom d'affichage web (optionnel)"
                            className="w-full rounded-lg border border-gray-200 p-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { saveWebLabel(product.id, webLabels[product.id] || ''); }}
                            className="rounded-lg bg-nolt-orange p-2 text-white hover:bg-orange-600"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => { setEditingProduct(null); }}
                            className="rounded-lg bg-gray-200 p-2 hover:bg-gray-300"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.label}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                              <Image className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div>
                            {(() => {
                              const displayLabel = product.webLabel; 
                              const originalDolibarrLabel = product.label;
                              const showOriginalLabelInParentheses = displayLabel && originalDolibarrLabel && displayLabel !== originalDolibarrLabel;

                              return (
                                <>
                                  <h3 className="font-thunder text-lg text-nolt-black">
                                    <span className={showOriginalLabelInParentheses ? "text-nolt-orange" : ""}>
                                      {displayLabel || originalDolibarrLabel} {/* Fallback au cas où displayLabel serait vide */}
                                    </span>
                                  </h3>
                                  {showOriginalLabelInParentheses && (
                                    <p className="text-xs text-gray-400 italic">
                                      (Dolibarr: {originalDolibarrLabel})
                                    </p>
                                  )}
                                </> 
                              );
                            })()}
                            <p className="text-sm text-gray-500">Réf: {product.ref}</p>
                            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleImageUpload(product.id, file);
                                }
                              }}
                            />
                            <Image className="h-5 w-5" />
                          </label>
                          <button
                            onClick={() => setEditingProduct(String(product.id))}
                            className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Afficher récursivement les sous-catégories */}
            {category.children?.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-thunder text-4xl text-nolt-black">
          Produits de {shop?.name}
        </h1>
        <p className="mt-2 text-gray-600 font-montserrat">
          Gérez les produits de votre boutique, modifiez leurs noms d'affichage et ajoutez des images.
        </p>
      </div>

      <div className="space-y-6">
        {categories.length > 0 ? (
          categories.map(category => renderCategory(category))
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 font-montserrat">Aucune catégorie trouvée pour cette boutique.</p>
          </div>
        )}
      </div>
    </div>
  );
} 