import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalTtc: number;
  createdAt: string;
  orders: { id: string }[];
}

export function CampaignsList() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery<Campaign[]>({
    queryKey: ['admin-campaigns'],
    queryFn: async () => {
      const res = await fetch('/api/campaigns');
      if (!res.ok) throw new Error('Erreur réseau');
      return res.json();
    }
  });

  if (isLoading) return <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Chargement...</div>;
  if (error) return <div className="flex items-center gap-2 text-red-600"><AlertTriangle /> Impossible de charger</div>;

  return (
    <div>
      <h1 className="text-2xl font-thunder text-nolt-black mb-6">Campagnes</h1>
      <div className="overflow-x-auto bg-white shadow-sm rounded-xl">
        <table className="min-w-full text-sm font-montserrat">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Créée le</th>
              <th className="px-4 py-3 text-left">Commandes</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {data && data.map(c => (
              <tr
                key={c.id}
                className="border-b last:border-none hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/admin/campaigns/${c.id}`)}
              >
                <td className="px-4 py-3 font-medium text-nolt-orange">{c.name}</td>
                <td className="px-4 py-3">{format(new Date(c.createdAt), 'dd MMM yyyy', { locale: fr })}</td>
                <td className="px-4 py-3">{c.orders?.length || 0}</td>
                <td className="px-4 py-3">{Number(c.totalTtc).toFixed(2)} €</td>
                <td className="px-4 py-3">{c.status}</td>
              </tr>
            ))}
            {data && data.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucune campagne</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 