import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OrderItem {
  id: string;
  totalTtc: number;
  status: string;
  createdAt: string;
  user: { name: string };
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  totalTtc: number;
  createdAt: string;
  orders: OrderItem[];
}

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<Campaign>({
    queryKey: ['admin-campaign', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${id}`);
      if (!res.ok) throw new Error('Erreur réseau');
      return res.json();
    }
  });

  if (isLoading) return <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Chargement...</div>;
  if (error)    return <div className="flex items-center gap-2 text-red-600"><AlertTriangle /> Impossible de charger la campagne</div>;
  if (!data)    return null;

  return (
    <div>
      <button onClick={()=>navigate(-1)} className="flex items-center gap-1 text-nolt-orange hover:text-nolt-yellow mb-6 font-montserrat">
        <ArrowLeft className="h-4 w-4"/> Retour
      </button>

      <h1 className="text-2xl font-thunder text-nolt-black mb-2">Campagne {data.name}</h1>
      <p className="mb-6 text-gray-600 font-montserrat">Créée le {format(new Date(data.createdAt), 'PPPP', { locale: fr })}</p>

      <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="font-montserrat"><strong>Statut :</strong> {data.status}</p>
            {data.description && <p className="font-montserrat mt-1 text-sm text-gray-600">{data.description}</p>}
          </div>
          <div className="text-right font-bold text-lg font-montserrat">Total : {Number(data.totalTtc).toFixed(2)} €</div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-thunder text-xl mb-4 italic text-nolt-orange">Commandes</h2>
        <table className="min-w-full text-sm font-montserrat">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map(o => (
              <tr key={o.id} className="border-b last:border-none hover:bg-gray-50 cursor-pointer" onClick={()=>navigate(`/admin/orders/${o.id}`)}>
                <td className="px-4 py-3 text-nolt-orange font-medium">{o.id.substring(0,8)}…</td>
                <td className="px-4 py-3">{format(new Date(o.createdAt), 'dd MMM yyyy', { locale: fr })}</td>
                <td className="px-4 py-3">{o.user?.name ?? '—'}</td>
                <td className="px-4 py-3">{Number(o.totalTtc).toFixed(2)} €</td>
                <td className="px-4 py-3">{o.status}</td>
              </tr>
            ))}
            {data.orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucune commande</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
} 