import React, { useState } from 'react';
import { X, UploadCloud, Save, Image } from 'lucide-react';
import type { Product } from '../../types/shop';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../../services/api';

interface AdminProductDetailPopupProps {
  product: Product;
  shopId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminProductDetailPopup({ product, shopId, isOpen, onClose }: AdminProductDetailPopupProps) {
  const [webLabel, setWebLabel] = useState<string>(product.webLabel ?? '');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const updateLabelMutation = useMutation({
    mutationFn: async (newLabel: string) => {
      console.log('Mise à jour du label:', { productId: product.id, newLabel });
      return shopApi.updateWebLabel(product.id.toString(), newLabel);
    },
    onSuccess: () => {
      console.log('Label mis à jour avec succès');
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'admin-fc-products' });
      onClose();
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du label:', error);
    }
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await shopApi.uploadProductImage(product.id, formData);
      queryClient.invalidateQueries({ queryKey: ['admin-fc-products'] });
    } catch (err) {
      console.error('Erreur upload image', err);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-600 hover:text-red-600">
            <X className="h-6 w-6" />
          </button>

          {/* Image */}
          <div className="flex flex-col items-center mb-6">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.label} className="h-64 w-full object-cover rounded-lg" />
            ) : (
              <div className="h-64 w-full flex items-center justify-center bg-gray-100 rounded-lg">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <label className="mt-4 inline-flex items-center gap-2 cursor-pointer text-sm text-nolt-orange hover:text-nolt-yellow">
              <UploadCloud className="h-5 w-5" />
              <span>{uploading ? 'Téléchargement…' : 'Uploader une nouvelle image'}</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={uploading} />
            </label>
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
                updateLabelMutation.mutate(webLabel);
              }}
              disabled={updateLabelMutation.isPending}
              className="flex items-center gap-2 bg-nolt-orange hover:bg-nolt-yellow text-white px-4 py-2 rounded-lg"
            >
              <Save className="h-4 w-4" />
              {updateLabelMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 