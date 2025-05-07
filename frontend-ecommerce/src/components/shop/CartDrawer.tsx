import React from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, total, itemCount } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md transform bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-nolt-yellow" />
              <h2 className="font-thunder text-2xl uppercase italic text-nolt-orange">
                Panier ({itemCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-montserrat">Votre panier est vide</p>
                <button
                  onClick={onClose}
                  className="mt-4 text-nolt-orange hover:text-nolt-yellow transition-colors font-montserrat"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex gap-4 rounded-xl border p-4 bg-white"
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.label}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex flex-1 flex-col">
                      <h3 className="font-thunder text-xl uppercase text-nolt-orange">{product.label}</h3>
                      <p className="text-sm text-gray-500 font-montserrat">{product.ref}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-montserrat">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                            disabled={quantity >= product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-2 text-right font-thunder text-xl text-nolt-yellow italic">
                        {(product.price * quantity).toFixed(2)}€
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-montserrat font-medium">Total</span>
                <span className="text-2xl font-bold text-nolt-yellow font-thunder italic">
                  {total.toFixed(2)}€
                </span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full rounded-xl bg-nolt-orange py-3 font-semibold text-white hover:bg-nolt-yellow hover:text-nolt-black transition-colors font-montserrat"
              >
                Passer la commande
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}