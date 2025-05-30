import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Store, ShoppingBag, Filter, Search, ChevronDown, ChevronRight, Grid, List, ChevronUp, Heart, Star, Plus, Minus, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { shopApi } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { CartDrawer } from '../../components/CartDrawer';
import { ProductDetailPopup } from '../../components/shop/ProductDetailPopup';
import type { Product, CategoryTree, Shop } from '../../types/shop';

export function PublicShopView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // For product quantity selection
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const getQuantity = (productId: number) => quantities[productId] || 1;
  const incrementQuantity = (productId: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1
    }));
  };
  const decrementQuantity = (productId: number) => {
    if ((quantities[productId] || 1) > 1) {
      setQuantities(prev => ({
        ...prev,
        [productId]: prev[productId] - 1
      }));
    }
  };

  // Charger la boutique courante
  const { data: shop, isLoading: isLoadingShop, error } = useQuery<Shop>({
    queryKey: ['public-shop', id],
    queryFn: () => shopApi.getShop(id || ''),
    enabled: !!id
  });

  // Charger les sous-catégories de la boutique courante
  const [subcategories, setSubcategories] = useState<{id: string, label: string}[]>([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [errorCategory, setErrorCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!shop) return;
    setIsLoadingCategory(true);
    setErrorCategory(null);
    fetch('http://localhost:4000/api/catalog/categories')
      .then(res => res.json())
      .then(async (categories) => {
        const racine = categories.find((cat: any) => cat.dolibarrId === shop.dolibarrCategoryId);
        if (!racine) {
          setSubcategories([]);
          setIsLoadingCategory(false);
          setErrorCategory('Catégorie racine non trouvée');
          return;
        }
        fetch(`http://localhost:4000/api/catalog/categories?parent=${racine.id}`)
          .then(res => res.json())
          .then(async (subcats) => {
            const subCategories = subcats.map((cat: any) => ({ id: String(cat.id), label: cat.label }));
            setSubcategories(subCategories);
            setIsLoadingCategory(false);
          });
      });
  }, [shop]);

  // Générer dynamiquement les catégories d'affichage à partir des sous-catégories
  type DisplayCategory = { id: string; name: string; count: number; subcategoryId?: string };
  const categories: DisplayCategory[] = useMemo(() => {
    const dynamicCategories: DisplayCategory[] = [
      { id: 'all', name: 'Tous les produits', count: 0 }
    ];
    subcategories.forEach((subcat) => {
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

  // Récupérer les produits de la catégorie sélectionnée ou tous les produits de la boutique
  const { data: selectedCategoryProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products-public-shop', id, selectedCategory],
    queryFn: async () => {
      const selectedCatObj = categories.find(cat => cat.id === selectedCategory);
      if (selectedCategory && selectedCategory !== 'all' && selectedCatObj?.subcategoryId) {
        return shopApi.getProducts({ category: selectedCatObj.subcategoryId });
      }
      // Tous les produits de toutes les sous-catégories de cette boutique
      const allProductsPromises = subcategories.map(
        subcat => shopApi.getProducts({ category: subcat.id })
      );
      const results = await Promise.all(allProductsPromises);
      return results.flat();
    },
    enabled: !isLoadingCategory && !!shop
  });

  // Demo sizes
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  if (isLoadingShop || isLoading || isLoadingCategory) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 animate-bounce text-nolt-yellow" />
          <p className="mt-4 font-montserrat text-nolt-black">Chargement de la boutique...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl bg-red-50 p-8 text-center">
          <h2 className="font-thunder text-2xl text-red-600 italic uppercase">
            Oups ! Boutique non trouvée
          </h2>
          <p className="mt-2 text-red-600 font-montserrat">
            Cette boutique n'existe pas ou n'est plus disponible.
          </p>
          <Link
            to="/public/shops"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-nolt-orange px-6 py-3 font-semibold text-white transition-all hover:bg-nolt-yellow hover:text-nolt-black font-montserrat"
          >
            <ArrowLeft className="h-5 w-5" />
            Voir toutes les boutiques
          </Link>
        </div>
      </div>
    );
  }

  if (errorCategory) {
    return <div>Erreur lors du chargement des sous-catégories.</div>;
  }
  if (!isLoadingCategory && subcategories && subcategories.length === 0) {
    return <div>Aucune sous-catégorie trouvée.</div>;
  }

  const filteredProducts = selectedCategoryProducts;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero banner */}
      <div className="relative bg-nolt-black py-24 flex items-center justify-center overflow-hidden">
        {/* Main background image */}
        <div className="absolute inset-0">
          <img 
            src="https://pic.gowizzyou.com/uploads/chalon_back.png" 
            alt="FC Chalon player" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Diagonal overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-nolt-orange/80 via-nolt-orange/70 to-nolt-black/70" />
        
        <div className="relative text-center text-white px-4 max-w-4xl mx-auto">
          <div className="mb-4 text-nolt-yellow font-montserrat font-bold tracking-wider">INDESTRUCTIBLES DEPUIS 1926</div>
          <h1 className="font-thunder text-7xl mb-6 tracking-tight italic uppercase">{shop.name}</h1>
          <p className="max-w-2xl mx-auto text-xl font-montserrat">{shop.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-nolt-yellow text-nolt-black rounded-xl font-semibold flex items-center gap-2 hover:bg-yellow-300 transition-colors text-lg font-montserrat"
            >
              Découvrir nos produits
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/public/shops"
              className="inline-flex items-center gap-2 text-nolt-orange hover:text-nolt-yellow transition-colors font-montserrat"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Retour aux boutiques</span>
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 text-nolt-orange hover:text-nolt-yellow transition-colors"
            >
              <ShoppingBag className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-nolt-yellow text-xs text-nolt-black font-bold">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-10">
          <Link to="/home" className="text-gray-500 hover:text-nolt-orange transition-colors font-montserrat">Accueil</Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link to="/public/shops" className="text-gray-500 hover:text-nolt-orange transition-colors font-montserrat">Boutiques</Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="font-semibold font-montserrat">{shop.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8" id="product-grid">
          {/* Sidebar filters */}
          <div className={`lg:w-64 bg-white ${filterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-20">
              <div className="border-b pb-6 mb-6">
                <button 
                  className="flex lg:hidden items-center justify-between w-full text-xl font-thunder uppercase font-semibold text-nolt-black mb-4"
                  onClick={() => setFilterOpen(false)}
                >
                  Filtres
                  <ChevronUp className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-thunder italic uppercase text-nolt-black mb-4">Catégories</h2>
                <div className="border-b pb-6 mb-6 bg-white rounded-lg p-4 shadow-sm">
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

              <div className="border-b pb-6 mb-6">
                <h2 className="text-xl font-thunder italic uppercase text-nolt-black mb-4">Taille</h2>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button 
                      key={size}
                      className={`w-10 h-10 flex items-center justify-center border rounded-md font-medium ${
                        selectedSize === size 
                          ? 'border-nolt-yellow bg-nolt-yellow/10 text-nolt-orange font-montserrat' 
                          : 'border-gray-300 hover:border-nolt-yellow font-montserrat'
                      }`}
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Filters toolbar */}
            <div className="flex flex-wrap gap-4 items-center justify-between mb-8 pb-4 border-b">
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full sm:w-80 px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nolt-yellow font-montserrat"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  className="lg:hidden flex items-center gap-1 text-nolt-orange hover:text-nolt-yellow transition-colors font-montserrat"
                  onClick={() => setFilterOpen(true)}
                >
                  <Filter className="h-5 w-5" />
                  <span>Filtres</span>
                </button>

                <div className="hidden sm:flex items-center gap-3 text-gray-600">
                  <span className="font-montserrat">Affichage:</span>
                  <button 
                    className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-nolt-yellow' : 'hover:text-nolt-yellow'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button 
                    className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-100 text-nolt-yellow' : 'hover:text-nolt-yellow'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative">
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-montserrat">
                    <span>Trier par</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products count */}
            <p className="mb-8 text-gray-500 font-montserrat">
              {filteredProducts.length} produits disponibles
            </p>

            <div className="transition-opacity">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-thunder italic uppercase text-gray-900 mb-2">Aucun produit trouvé</h3>
                  <p className="mt-2 text-gray-500 font-montserrat">
                    Essayez de modifier vos filtres ou sélectionnez une autre catégorie.
                  </p>
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="mt-4 text-nolt-orange hover:text-nolt-yellow transition-colors font-montserrat"
                  >
                    Voir tous les produits
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8'
                  : 'space-y-6'
                }>
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className={`group border border-gray-200 hover:border-nolt-yellow transition-all duration-300 rounded-lg overflow-hidden ${
                        viewMode === 'grid' ? 'flex flex-col bg-white' : 'flex bg-white'
                      }`}
                    >
                      {/* Product image */}
                      <div 
                        className={`${viewMode === 'grid' ? 'w-full relative cursor-pointer' : 'w-1/3 relative cursor-pointer'}`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.webLabel || product.label}
                            className={`w-full ${viewMode === 'grid' ? 'aspect-square' : 'h-full'} object-cover`}
                          />
                        ) : (
                          <div className={`w-full ${viewMode === 'grid' ? 'aspect-square' : 'h-full'} bg-gray-100 flex items-center justify-center`}>
                            <Package className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Quick actions overlay */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors">
                            <Heart className="h-5 w-5 text-nolt-orange hover:text-nolt-yellow transition-colors" />
                          </button>
                        </div>

                        {/* Tag overlay for new products */}
                        {product.id % 3 === 0 && (
                          <div className="absolute top-3 left-3 bg-nolt-yellow text-nolt-black px-3 py-1 rounded-md font-thunder text-sm font-bold uppercase">
                            Nouveau
                          </div>
                        )}
                      </div>
                      
                      {/* Product details */}
                      <div className={`flex-1 p-5 flex flex-col ${viewMode === 'list' ? 'justify-between' : ''}`}>
                        <div>
                          <h3 
                            className="font-thunder text-xl uppercase text-nolt-black group-hover:text-nolt-orange transition-colors leading-tight cursor-pointer"
                            onClick={() => setSelectedProduct(product)}
                          >
                            {product.label}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 font-montserrat">{product.ref}</p>
                          {product.description && (
                            <p className={`text-sm text-gray-600 mt-3 font-montserrat ${viewMode === 'grid' ? 'line-clamp-2' : ''}`}>
                              {product.description}
                            </p>
                          )}
                          
                          {/* Rating stars (demo) */}
                          <div className="flex items-center mt-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${star <= 4 ? 'text-nolt-yellow fill-nolt-yellow' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1 font-montserrat">(12)</span>
                          </div>
                          
                          {/* Size selector (demo) */}
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-1">
                              {sizes.map(size => (
                                <button 
                                  key={size}
                                  className={`w-8 h-8 text-xs border ${
                                    selectedSize === size 
                                      ? 'border-nolt-yellow bg-nolt-yellow/10 text-nolt-orange' 
                                      : 'border-gray-300 hover:border-nolt-yellow'
                                  } rounded-md flex items-center justify-center font-medium font-montserrat`}
                                  onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className={`${viewMode === 'grid' ? 'mt-5' : 'mt-4'}`}>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-2xl font-thunder italic text-nolt-yellow">
                                {typeof product.price === 'number' ? product.price.toFixed(2) : '—'}€
                              </p>
                              <p className="text-xs text-gray-500 font-montserrat">
                                {product.stock > 0 ? (
                                  <span className="text-green-600">En stock</span>
                                ) : (
                                  <span className="text-red-500">Rupture de stock</span>
                                )}
                              </p>
                            </div>
                            
                            {viewMode === 'list' && (
                              <div className="flex items-center">
                                <button 
                                  onClick={() => decrementQuantity(product.id)}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md"
                                  disabled={getQuantity(product.id) <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <div className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300 font-montserrat">
                                  {getQuantity(product.id)}
                                </div>
                                <button 
                                  onClick={() => incrementQuantity(product.id)}
                                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
          </div>
        )}
                          </div>
                          
                          {viewMode === 'grid' ? (
                            <div className="flex gap-2 mt-4">
                              <button 
                                onClick={() => {
                                  addToCart(product, getQuantity(product.id));
                                  setIsCartOpen(true);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-nolt-orange text-white px-4 py-3 rounded-lg hover:bg-nolt-yellow hover:text-nolt-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-montserrat font-medium"
                                disabled={product.stock === 0}
                              >
                                <ShoppingBag className="h-5 w-5" />
                                Ajouter
                              </button>
                              <button 
                                onClick={() => setSelectedProduct(product)}
                                className="px-3 py-3 border border-gray-300 rounded-lg hover:border-nolt-yellow hover:text-nolt-yellow transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="11" cy="11" r="8"></circle>
                                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                  <line x1="11" y1="8" x2="11" y2="14"></line>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                addToCart(product, getQuantity(product.id));
                                setIsCartOpen(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 bg-nolt-orange text-white px-4 py-3 rounded-lg hover:bg-nolt-yellow hover:text-nolt-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-montserrat font-medium mt-4"
                              disabled={product.stock === 0}
                            >
                              <ShoppingBag className="h-5 w-5" />
                              Ajouter
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panier */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          navigate('/checkout');
        }}
      />

      {/* Product Detail Popup */}
      {selectedProduct && (
        <ProductDetailPopup
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}