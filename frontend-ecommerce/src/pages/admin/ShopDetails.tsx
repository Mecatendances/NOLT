// Fichier minimal pour permettre au routing de fonctionner
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { shopApi } from '../../services/api';
import type { Shop } from '../../types/shop';
import { Users, ShoppingBag } from 'lucide-react';

export function ShopDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    shopApi.getShop(id)
      .then(setShop)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8">Chargement des informations de la boutique...</div>;
  }

  if (!shop) {
    return <div className="p-8 text-red-500">Boutique introuvable.</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-thunder text-3xl text-nolt-black mb-2">{shop.name}</h1>
      <p className="mb-4 text-gray-600">{shop.description}</p>
      <div className="mb-6 flex gap-8">
        <div>
          <span className="font-bold">{shop.products?.length ?? 0}</span> produit(s)
        </div>
        <div>
          <span className="font-bold">{shop.orders?.length ?? 0}</span> commande(s)
        </div>
        <div>
          <span className="font-bold">{shop.adminId}</span> admin
        </div>
      </div>
      <div className="flex gap-4 mb-8">
        <button
          className="flex items-center gap-2 bg-nolt-orange text-white px-4 py-2 rounded-lg hover:bg-nolt-yellow transition-colors"
          onClick={() => navigate(`/admin/shops/${shop.id}/products`)}
        >
          <ShoppingBag className="h-5 w-5" /> Gérer les produits
        </button>
        <button
          className="flex items-center gap-2 bg-nolt-orange text-white px-4 py-2 rounded-lg hover:bg-nolt-yellow transition-colors"
          onClick={() => navigate(`/admin/shops/${shop.id}/roles`)}
        >
          <Users className="h-5 w-5" /> Gérer les utilisateurs & rôles
        </button>
      </div>
      <Link
        to="/admin/shops"
        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
      >
        Retour à la liste des boutiques
      </Link>
    </div>
  );
}