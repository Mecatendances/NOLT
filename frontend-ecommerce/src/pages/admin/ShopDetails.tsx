// Fichier minimal pour permettre au routing de fonctionner
import React from 'react';
import { Link, useParams } from 'react-router-dom';

export function ShopDetails() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <h1 className="text-2xl font-thunder text-nolt-black mb-4">Détails de la boutique {id}</h1>
      <p className="mb-4">Chargement des détails...</p>
      <Link 
        to="/admin/shops" 
        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
      >
        Retour aux boutiques
      </Link>
    </div>
  );
}