import React, { useState } from 'react';
import { X, ShoppingBag, Heart, ChevronLeft, ChevronRight, Plus, Minus, Star } from 'lucide-react';
import { Product } from '../types/shop';
import { useCart } from '../contexts/CartContext';

interface ProductDetailPopupProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailPopup({ product, isOpen, onClose }: ProductDetailPopupProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);

  // Demo sizes
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // For demo purposes, we'll create an array of images 
  // In a real app, this would come from your product data
  const images = [
    product.image_url,
    // Add additional images - in a real app these would come from your backend
    product.image_url?.replace('.jpg', '-2.jpg') || '',
    product.image_url?.replace('.jpg', '-3.jpg') || ''
  ].filter(Boolean);

  if (!isOpen) return null;

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || undefined);
    onClose();
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // Prevent scroll on body when popup is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-4xl">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-600 hover:bg-white hover:text-nolt-orange transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Image section */}
            <div className="md:w-1/2 bg-gray-100 relative h-96 md:h-auto">
              {/* Main image */}
              <div className="relative h-full">
                <img 
                  src={images[currentImage]} 
                  alt={product.label} 
                  className="h-full w-full object-cover"
                />
                
                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 hover:bg-white hover:text-nolt-orange transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 hover:bg-white hover:text-nolt-orange transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail navigation */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`h-3 w-3 rounded-full ${
                        currentImage === index ? 'bg-nolt-yellow' : 'bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product details section */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
              <div className="flex-1">
                <h2 className="font-thunder text-3xl text-nolt-black italic uppercase mb-2">{product.label}</h2>
                <p className="text-sm text-gray-500 font-montserrat">{product.ref}</p>
                
                {/* Rating */}
                <div className="flex items-center my-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= 4 ? 'text-nolt-yellow fill-nolt-yellow' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1 font-montserrat">(12 avis)</span>
                </div>

                <p className="text-2xl font-thunder italic text-nolt-yellow mb-4">{product.price.toFixed(2)}€</p>
                
                {product.description && (
                  <div className="my-4">
                    <h3 className="font-semibold text-nolt-black mb-2 font-montserrat">Description</h3>
                    <p className="text-gray-600 font-montserrat">{product.description}</p>
                  </div>
                )}

                {/* Size selection */}
                <div className="my-6">
                  <h3 className="font-semibold text-nolt-black mb-3 font-montserrat">Taille</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <button 
                        key={size}
                        className={`h-10 w-10 flex items-center justify-center border rounded-md font-medium font-montserrat transition-colors ${
                          selectedSize === size 
                            ? 'border-nolt-yellow bg-nolt-yellow/10 text-nolt-orange' 
                            : 'border-gray-300 hover:border-nolt-yellow'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock information */}
                <p className="text-sm font-montserrat mb-6">
                  {product.stock > 0 ? (
                    <span className="text-green-600">En stock ({product.stock} disponibles)</span>
                  ) : (
                    <span className="text-red-500">Rupture de stock</span>
                  )}
                </p>

                {/* Quantity selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-montserrat">Quantité:</span>
                  <div className="flex items-center">
                    <button 
                      onClick={decrementQuantity}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="w-12 h-10 flex items-center justify-center border-t border-b border-gray-300 font-montserrat">
                      {quantity}
                    </div>
                    <button 
                      onClick={incrementQuantity}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md disabled:opacity-50"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-nolt-orange text-white py-3 rounded-lg hover:bg-nolt-yellow hover:text-nolt-black transition-colors font-montserrat font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={product.stock === 0 || !selectedSize}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Ajouter au panier
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg hover:border-nolt-yellow hover:text-nolt-yellow transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>

                {/* Product features */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="font-semibold text-nolt-black mb-3 font-montserrat">Caractéristiques</h3>
                  <ul className="space-y-2 text-sm text-gray-600 font-montserrat">
                    <li className="flex items-start">
                      <span className="text-nolt-yellow mr-2">•</span>
                      100% polyester recyclé, technologie DriFit
                    </li>
                    <li className="flex items-start">
                      <span className="text-nolt-yellow mr-2">•</span>
                      Logo FC Chalon brodé
                    </li>
                    <li className="flex items-start">
                      <span className="text-nolt-yellow mr-2">•</span>
                      Lavable en machine à 30°C
                    </li>
                    <li className="flex items-start">
                      <span className="text-nolt-yellow mr-2">•</span>
                      Conçu et fabriqué en France
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}