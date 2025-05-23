import React, { useState } from 'react';
import { X, UploadCloud, Save, Image } from 'lucide-react';
import type { Product, ProductImage } from '../../types/shop';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../../services/api';
import { ProductImageManager } from './ProductImageManager';

interface AdminProductDetailPopupProps {
  product: Product;
  shopId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminProductDetailPopup({ product, shopId, isOpen, onClose }: AdminProductDetailPopupProps) {
  const [webLabel, setWebLabel] = useState<string>(product.webLabel ?? '');
  const initialImages: ProductImage[] = (product.images ?? []).map((img, index) =>
    typeof img === 'string'
      ? { 
          id: -index - 1, // Utilisation d'IDs négatifs pour les images temporaires
          url: img, 
          alt: product.webLabel || product.label, 
          order: index, 
          productId: product.id 
        }
      : img
  );
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const queryClient = useQueryClient();

  const { mutate: updateLabel, isPending } = useMutation({
    mutationFn: async (newLabel: string) => {
      console.log('Mise à jour du label:', { productId: product.id, newLabel });
      return shopApi.updateProduct(shopId, product.id, { webLabel: newLabel });
    },
    onSuccess: () => {
      console.log('Label mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-fc-products'] });
      onClose();
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du label:', error);
      alert('Erreur lors de la mise à jour du label. Veuillez réessayer.');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-600 hover:text-red-600">
            <X className="h-6 w-6" />
          </button>

          {/* Images */}
          <div className="flex flex-col items-center mb-6 w-full">
            <ProductImageManager
              productId={product.id}
              initialImages={images}
              onImagesChange={setImages}
            />
          </div>

          {/* Web label */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-montserrat text-gray-600">Nom d'affichage web</label>
            <input
              type="text"
              value={webLabel}
              onChange={e => setWebLabel(e.target.value)}
              className="w-full border rounded-lg p-2 font-montserrat"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                console.log('Clic sur sauvegarder');
                updateLabel(webLabel);
              }}
              disabled={isPending}
              className="flex items-center gap-2 bg-nolt-orange hover:bg-nolt-yellow text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 