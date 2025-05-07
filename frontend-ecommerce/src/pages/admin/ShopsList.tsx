// Fichier minimal pour permettre au routing de fonctionner
import React from 'react';
import { Link } from 'react-router-dom';

export function ShopsList() {
  return (
    <div>
      <h1 className="text-2xl font-thunder text-nolt-black mb-4">Gestion des boutiques</h1>
      <p className="mb-4">Cette section vous permet de gérer les boutiques du site</p>
      <div className="flex gap-4">
        <Link 
          to="/admin/shops/new" 
          className="bg-nolt-orange text-white px-4 py-2 rounded-lg"
        >
          Nouvelle boutique
        </Link>
      </div>
    </div>
  );
}