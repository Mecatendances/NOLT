// Fichier minimal pour permettre au routing de fonctionner
import React from 'react';
import { Link } from 'react-router-dom';

export function Pages() {
  return (
    <div>
      <h1 className="text-2xl font-thunder text-nolt-black mb-4">Gestion des pages</h1>
      <p className="mb-4">Cette section vous permet de gérer les pages du site</p>
      <div className="flex gap-4">
        <Link 
          to="/admin/pages/new" 
          className="bg-nolt-orange text-white px-4 py-2 rounded-lg"
        >
          Nouvelle page
        </Link>
      </div>
    </div>
  );
}