import React, { useEffect } from 'react';
import { ShoppingBag, Package } from 'lucide-react';
import { Product } from '../types/shop';

interface ProductListProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  selectedProducts?: Product[];
}

export function ProductList({ products = [], onProductSelect, selectedProducts = [] }: ProductListProps) {
  useEffect(() => {
    console.log('ProductList - Produits reçus:', products);
    products.forEach(product => {
      console.log(`Produit ${product.id}:`, {
        label: product.label,
        webLabel: product.webLabel,
        imageUrl: product.imageUrl,
        price: product.price,
        stock: product.stock
      });
    });
  }, [products]);

  const isSelected = (product: Product) => 
    selectedProducts.some(p => p.id === product.id);

  if (!products.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map(product => (
        <div
          key={product.id}
          className={`relative rounded-lg border p-4 transition-all hover:shadow-md ${
            isSelected(product) ? 'border-nolt-orange bg-orange-50' : 'border-gray-200'
          }`}
        >
          <div className="relative aspect-square overflow-hidden rounded-lg">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.webLabel || product.label}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-nolt-black">
                {product.webLabel || product.label}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{product.ref}</p>
              {product.description && (
                <p className="mt-2 text-sm text-gray-600">{product.description}</p>
              )}
              <div className="mt-2 flex items-center gap-4">
                <span className="text-lg font-semibold text-nolt-orange">
                  {product.price.toFixed(2)}€
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Package className="h-4 w-4" />
                  Stock: {product.stock}
                </span>
              </div>
            </div>
            <button
              onClick={() => onProductSelect(product)}
              className={`rounded-full p-2 transition-colors ${
                isSelected(product)
                  ? 'bg-nolt-orange text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-nolt-orange hover:text-white'
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}