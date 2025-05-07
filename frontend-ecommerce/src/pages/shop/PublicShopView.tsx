import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Store, ShoppingBag, ArrowLeft, Package, Heart, Share2, ChevronRight, Filter, ChevronDown, Star, Plus, Minus, ArrowRight } from 'lucide-react';
import { shopApi } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { CartDrawer } from '../../components/shop/CartDrawer';
import { Configurator3D } from '../../components/Configurator3D';
import { ProductDetailPopup } from '../../components/shop/ProductDetailPopup';
import type { Shop, Product } from '../../types/shop';

export function PublicShopView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { data: shop, isLoading, error } = useQuery<Shop>({
    queryKey: ['public-shop', id],
    queryFn: () => shopApi.getShop(Number(id)),
    enabled: !!id
  });

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

  // Demo categories
  const categories = [
    'Tous les produits',
    'Maillots',
    'Shorts',
    'Chaussettes',
    'Training',
    'Accessoires'
  ];

  // Demo sizes
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  if (isLoading) {
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

  // Sort products by category (for demo purposes)
  const getProductsByCategory = () => {
    if (!selectedCategory || selectedCategory === 'Tous les produits') {
      return shop.products;
    }
    // In a real app, you would filter based on a category field
    // Here we're using a simplified approach for demo purposes
    const categoryMap: Record<string, RegExp> = {
      'Maillots': /maillot/i,
      'Shorts': /short/i,
      'Chaussettes': /chaussette/i,
      'Training': /training|survet/i,
      'Accessoires': /access|ballon|gant|bonnet|écharpe|casquette|sac/i
    };
    
    const regex = categoryMap[selectedCategory];
    return regex ? shop.products.filter(p => 
      regex.test(p.label) || (p.description && regex.test(p.description))
    ) : shop.products;
  };

  const filteredProducts = getProductsByCategory();

  return (
    <div className="min-h-screen bg-white">
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
          <Link to="/" className="text-gray-500 hover:text-nolt-orange transition-colors font-montserrat">Accueil</Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link to="/public/shops" className="text-gray-500 hover:text-nolt-orange transition-colors font-montserrat">Boutiques</Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="font-medium font-montserrat">{shop.name}</span>
        </div>

        {/* En-tête de la boutique */}
        <div className="mb-16 text-center">
          <h1 className="font-thunder text-5xl text-nolt-black mb-6 italic uppercase">{shop.name}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-montserrat">{shop.description}</p>
        </div>

        {/* Configurateur 3D */}
        <div className="mb-16 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-8 border-b bg-nolt-orange text-white">
            <h2 className="font-thunder text-3xl italic uppercase">Personnalisez votre équipement</h2>
            <p className="text-white/80 mt-2 font-montserrat">
              Créez votre équipement unique avec notre configurateur 3D interactif
            </p>
          </div>
          <div className="p-8">
            <Configurator3D className="mb-8" />
            <div className="flex justify-center">
              <button className="bg-nolt-orange text-white px-8 py-3 rounded-lg hover:bg-nolt-yellow hover:text-nolt-black transition-colors font-montserrat font-medium">
                Sauvegarder ma configuration
              </button>
            </div>
          </div>
        </div>

        {/* Category navigation */}
        <div className="mb-10 overflow-x-auto">
          <div className="flex space-x-4 pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-5 py-2 rounded-lg font-montserrat ${
                  selectedCategory === category
                    ? 'bg-nolt-orange text-white font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Filters and toolbar */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-montserrat">
                <span>Trier par</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-montserrat">
                <span>Taille</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {/* Size dropdown would go here */}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-montserrat">Affichage:</span>
            <button 
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-nolt-yellow' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button 
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-100 text-nolt-yellow' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Products count */}
        <p className="mb-8 text-gray-500 font-montserrat">
          {filteredProducts.length} produits disponibles
        </p>

        {/* Products grid */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8" 
          : "space-y-6"
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
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.label}
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
              <div 
                className={`flex-1 p-5 flex flex-col ${viewMode === 'list' ? 'justify-between' : ''}`}
              >
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
                          onClick={() => setSelectedSize(size)}
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
                        {product.price.toFixed(2)}€
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
                          <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4 mt-4">
                      <button 
                        onClick={() => {
                          addToCart(product, getQuantity(product.id));
                          setIsCartOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-nolt-orange text-white px-5 py-3 rounded-lg hover:bg-nolt-yellow hover:text-nolt-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-montserrat font-medium"
                        disabled={product.stock === 0}
                      >
                        <ShoppingBag className="h-5 w-5" />
                        Ajouter au panier
                      </button>
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="px-4 py-3 border border-gray-300 rounded-lg hover:border-nolt-yellow hover:text-nolt-yellow transition-colors font-montserrat"
                      >
                        Voir détails
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No products message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-thunder italic uppercase text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="mt-2 text-gray-500 font-montserrat">
              Essayez de modifier vos filtres ou sélectionnez une autre catégorie.
            </p>
            <button 
              onClick={() => setSelectedCategory('Tous les produits')}
              className="mt-4 text-nolt-orange hover:text-nolt-yellow transition-colors font-montserrat"
            >
              Voir tous les produits
            </button>
          </div>
        )}

        {/* Related products */}
        <div className="mt-20">
          <h2 className="font-thunder text-3xl text-nolt-black mb-8 italic uppercase">Vous pourriez aussi aimer</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {shop.products.slice(0, 4).map((product) => (
              <div 
                key={product.id} 
                className="group border border-gray-200 hover:border-nolt-yellow transition-all duration-300 rounded-lg overflow-hidden bg-white cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.label}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                      <Package className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-thunder text-lg uppercase text-nolt-black line-clamp-1 group-hover:text-nolt-orange transition-colors">
                    {product.label}
                  </h3>
                  <p className="mt-2 text-nolt-yellow font-thunder text-xl italic">{product.price.toFixed(2)}€</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                      setIsCartOpen(true);
                    }}
                    className="mt-3 w-full flex items-center justify-center bg-nolt-orange text-white px-3 py-2 rounded-lg hover:bg-nolt-yellow hover:text-nolt-black transition-colors font-montserrat text-sm font-medium"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unstoppable Section */}
      <div className="bg-nolt-orange py-16 mt-16">
        <div className="container mx-auto max-w-7xl px-4 text-center text-white">
          <h2 className="font-thunder text-4xl mb-6 italic uppercase">INDESTRUCTIBLES</h2>
          <p className="text-xl max-w-3xl mx-auto font-montserrat mb-10">
            Notre équipement est conçu pour ceux qui refusent d'abandonner, qui se relèvent après chaque chute, et qui transforment l'adversité en victoire.
          </p>
          <button className="bg-nolt-yellow text-nolt-black px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-yellow-300 transition-colors font-montserrat">
            Découvrir notre histoire
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Brand Promise Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="font-thunder text-3xl text-nolt-black mb-10 text-center italic uppercase">Nos garanties</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Produits Officiels",
                icon: "🏆",
                text: "Tous nos produits sont officiels et certifiés par les marques et fédérations."
              },
              {
                title: "Livraison Rapide",
                icon: "🚚",
                text: "Livraison express en 2-3 jours ouvrés partout en France métropolitaine."
              },
              {
                title: "Retours Gratuits",
                icon: "✅",
                text: "Satisfait ou remboursé sous 30 jours avec retour gratuit."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-thunder text-xl text-nolt-black mb-3 italic uppercase">{item.title}</h3>
                <p className="text-gray-600 font-montserrat">{item.text}</p>
              </div>
            ))}
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