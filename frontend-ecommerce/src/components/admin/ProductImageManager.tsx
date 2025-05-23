import React, { useState, useCallback, useEffect } from 'react';
import { Upload, X, ArrowUp, ArrowDown, Image as ImageIcon, Package } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { shopApi } from '../../services/api';

interface ProductImage {
  id: number;
  url: string;
  alt: string;
  order: number;
  productId?: number;
}

interface ProductImageManagerProps {
  productId: number;
  initialImages?: ProductImage[];
  onImagesChange?: (images: ProductImage[]) => void;
}

export function ProductImageManager({ productId, initialImages = [], onImagesChange }: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await shopApi.uploadProductImage(productId, formData);
        setImages(prev => [...prev, response]);
        onImagesChange?.([...images, response]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setIsUploading(false);
    }
  }, [productId, images, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  const deleteImage = async (imageId: number) => {
    try {
      await shopApi.deleteProductImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      onImagesChange?.(images.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[newIndex];
    newImages[newIndex] = temp;

    setImages(newImages);
    onImagesChange?.(newImages);

    try {
      await shopApi.reorderProductImages(productId, newImages.map(img => img.id));
    } catch (error) {
      console.error('Erreur lors du réordre:', error);
    }
  };

  // Ouvre la lightbox au clic sur une image
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Ferme la lightbox
  const closeLightbox = () => setLightboxOpen(false);

  // Navigation dans la lightbox
  const prevImage = () => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  const nextImage = () => setLightboxIndex((prev) => (prev + 1) % images.length);

  // Fermer la lightbox avec la touche Échap
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, images.length]);

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-nolt-yellow bg-yellow-50' : 'border-gray-300 hover:border-nolt-orange'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Déposez les images ici...'
            : 'Glissez-déposez des images ici, ou cliquez pour sélectionner'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, WEBP jusqu'à 5MB
        </p>
      </div>

      {/* Liste des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer" onClick={() => openLightbox(index)}>
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-nolt-orange text-white text-xs px-2 py-1 rounded shadow">Principale</span>
                )}
              </div>
              {/* Overlay avec actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => moveImage(index, 'up')}
                  disabled={index === 0}
                  className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 disabled:opacity-50"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => moveImage(index, 'down')}
                  disabled={index === images.length - 1}
                  className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 disabled:opacity-50"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteImage(image.id)}
                  className="p-2 rounded-full bg-white/80 hover:bg-white text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox/carrousel */}
      {lightboxOpen && images[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 text-white text-3xl" onClick={closeLightbox}>
            <X className="h-8 w-8" />
          </button>
          <button
            className="absolute left-8 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2 hover:bg-black/70"
            onClick={e => { e.stopPropagation(); prevImage(); }}
            disabled={images.length <= 1}
          >
            <ArrowUp style={{ transform: 'rotate(-90deg)' }} className="h-8 w-8" />
          </button>
          <img
            src={images[lightboxIndex].url}
            alt={images[lightboxIndex].alt}
            className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg border-4 border-white"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute right-8 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2 hover:bg-black/70"
            onClick={e => { e.stopPropagation(); nextImage(); }}
            disabled={images.length <= 1}
          >
            <ArrowUp style={{ transform: 'rotate(90deg)' }} className="h-8 w-8" />
          </button>
        </div>
      )}

      {/* État de chargement */}
      {isUploading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nolt-yellow mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Upload en cours...</p>
        </div>
      )}
    </div>
  );
} 