import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Store, ArrowRight } from 'lucide-react';
import { shopApi } from '../../services/api';
import Footer from '../../components/Footer';

export function PublicShopsList() {
  // Récupérer toutes les boutiques
  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['public-shops'],
    queryFn: shopApi.getShops,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section / Concept */}
      <div className="relative bg-nolt-black py-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://pic.gowizzyou.com/uploads/fcchalon.png" 
            alt="Boutiques NOLT" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-nolt-orange/90 to-black/70" />
        <div className="relative text-center text-white px-4 max-w-3xl mx-auto">
          <h1 className="font-thunder text-6xl mb-6 tracking-tight italic uppercase">Les Boutiques NOLT</h1>
          <p className="text-2xl font-thunder italic text-nolt-yellow mb-8">Un concept unique pour tous les clubs et communautés</p>
          <p className="max-w-2xl mx-auto text-lg font-montserrat mb-10">
            NOLT permet à chaque club, association ou communauté de créer sa propre boutique en ligne, de vendre ses produits personnalisés et de fédérer ses membres autour d'une expérience e-commerce moderne et collaborative.
          </p>
        </div>
      </div>

      {/* Liste des boutiques */}
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-thunder text-4xl text-center text-nolt-black mb-12 italic uppercase">Toutes les boutiques</h2>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Store className="h-12 w-12 animate-bounce text-nolt-yellow" />
            <span className="ml-4 text-nolt-black font-montserrat text-lg">Chargement des boutiques...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {shops.map((shop: any) => (
              <div key={shop.id} className="bg-white border border-gray-200 rounded-xl shadow hover:border-nolt-yellow transition-all p-8 flex flex-col items-start">
                <h3 className="font-thunder text-2xl text-nolt-black mb-2">{shop.name}</h3>
                <p className="text-gray-600 font-montserrat mb-6">{shop.description}</p>
                <Link
                  to={`/public/shops/${shop.id}`}
                  className="mt-auto inline-flex items-center gap-2 px-6 py-2 bg-nolt-yellow text-nolt-black rounded-lg font-semibold hover:bg-nolt-orange hover:text-white transition-colors"
                >
                    Découvrir
                    <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}