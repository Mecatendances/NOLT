import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-order', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(`/api/orders/admin/${id}`);
      if (!res.ok) throw new Error('Erreur réseau');
      return res.json();
    }
  });

  if (isLoading) return <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Chargement...</div>;
  if (error)    return <div className="flex items-center gap-2 text-red-600"><AlertTriangle /> Impossible de charger la commande</div>;
  if (!data)    return null;

  return (
    <div>
      <Link to="/admin/orders" className="flex items-center gap-1 text-nolt-orange hover:text-nolt-yellow mb-6 font-montserrat">
        <ArrowLeft className="h-4 w-4" /> Retour aux commandes
      </Link>

      <h1 className="text-2xl font-thunder text-nolt-black mb-4">Commande #{data.id.substring(0,8)}</h1>
      <p className="mb-6 text-gray-600 font-montserrat">Passée le {format(new Date(data.createdAt),'PPPP', { locale: fr })}</p>

      <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="font-thunder text-xl mb-4 italic text-nolt-orange">Client</h2>
        <p><strong>Nom :</strong> {data.user?.name ?? '—'}</p>
        <p><strong>Email :</strong> {data.user?.email ?? '—'}</p>
        <p><strong>Téléphone :</strong> {data.user?.phone || '-'}</p>
        <p className="mt-2"><strong>Adresse :</strong> {data.user?.address || '-'}, {data.user?.zipCode || ''} {data.user?.city || ''}</p>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-thunder text-xl mb-4 italic text-nolt-orange">Articles</h2>
        <table className="min-w-full text-sm font-montserrat">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Produit</th>
              <th className="px-4 py-3 text-left">Taille</th>
              <th className="px-4 py-3 text-left">Quantité</th>
              <th className="px-4 py-3 text-left">Prix unitaire</th>
              <th className="px-4 py-3 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: any) => (
              <tr key={item.id} className="border-b last:border-none">
                <td className="px-4 py-3">{item.product.label}</td>
                <td className="px-4 py-3">{item.size}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{Number(item.unitPriceTtc).toFixed(2)} €</td>
                <td className="px-4 py-3">{(Number(item.unitPriceTtc)*item.quantity).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right mt-4 font-bold font-montserrat text-lg">
          Total : {Number(data.totalTtc).toFixed(2)} €
        </div>
      </section>
    </div>
  );
} 