import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: number;
  size: string;
  quantity: number;
  unitPriceTtc: number;
  product: {
    id: string;
    label: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
}

interface Order {
  id: string;
  user: User;
  totalTtc: string | number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export function OrdersList() {
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders/admin');
      if (!res.ok) throw new Error('Erreur réseau');
      return res.json();
    }
  });

  const toggleSelect = (orderId: string) => {
    setSelectedIds(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };

  const handleAddToCampaign = async () => {
    if (selectedIds.length === 0) return;
    const name = window.prompt('Nom de la nouvelle campagne ?');
    if (!name) return;

    try {
      // Créer la campagne
      const createRes = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!createRes.ok) throw new Error('Erreur création campagne');
      const campaign = await createRes.json();

      // Ajouter les commandes
      await fetch(`/api/campaigns/${campaign.id}/add-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedIds })
      });

      alert('Campagne créée !');
      setSelectedIds([]);
      // invalidate queries if using react-query (will refetch automatically)
    } catch (e) {
      alert('Erreur lors de la création de la campagne');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" /> Chargement des commandes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle /> Impossible de récupérer les commandes
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-thunder text-nolt-black mb-6">Commandes</h1>

      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={handleAddToCampaign}
          disabled={selectedIds.length === 0}
          className="px-4 py-2 rounded-lg bg-nolt-orange text-white hover:bg-nolt-yellow hover:text-nolt-black disabled:opacity-50"
        >
          Ajouter à une campagne
        </button>
        {selectedIds.length > 0 && (
          <span className="text-sm text-gray-600">{selectedIds.length} sélectionnée(s)</span>
        )}
      </div>

      <div className="overflow-x-auto bg-white shadow-sm rounded-xl">
        <table className="min-w-full text-sm font-montserrat">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-2"></th>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {data && data.map(order => (
              <tr
                key={order.id}
                className="border-b last:border-none hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/admin/orders/${order.id}`)}
              >
                <td className="px-2 text-center" onClick={(e)=>{e.stopPropagation();toggleSelect(order.id);}}>
                  <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={()=>toggleSelect(order.id)} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-nolt-orange">{order.id.substring(0, 8)}…</td>
                <td className="px-4 py-3">{format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}</td>
                <td className="px-4 py-3">{order.user?.name ?? '—'}</td>
                <td className="px-4 py-3">{Number(order.totalTtc).toFixed(2)} €</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold 
                    ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${order.status === 'PAID' ? 'bg-green-100 text-green-800' : ''}
                    ${order.status === 'SENT' ? 'bg-blue-100 text-blue-800' : ''}
                    ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {data && data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucune commande pour le moment</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 