// Fichier minimal pour permettre au routing de fonctionner
import React from 'react';
import { Link } from 'react-router-dom';

export function PageEditor({ isEditing = false }: { isEditing?: boolean }) {
  return (
    <div>
      <h1 className="text-2xl font-thunder text-nolt-black mb-4">
        {isEditing ? 'Modifier la page' : 'Nouvelle page'}
      </h1>
      <p className="mb-4">Éditeur en cours de chargement...</p>
      <Link 
        to="/admin/pages" 
        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
      >
        Retour aux pages
      </Link>
    </div>
  );
}