import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

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
}

interface Order {
  id: string;
  user: User;
  totalTtc: string | number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function ShopAdminOrders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery<Order[]>({
    queryKey: ['shop-orders', id],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${id}/orders`);
      if (!res.ok) throw new Error('Erreur réseau');
      return res.json();
    },
    enabled: !!id
  });

  const toggleSelect = (orderId: string) => {
    setSelectedIds(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
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
      <h1 className="text-2xl font-thunder text-nolt-black mb-6">Commandes de la boutique</h1>
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
                onClick={() => navigate(`/shops/${id}/admin/orders/${order.id}`)}
              >
                <td className="px-2 text-center" onClick={e=>{e.stopPropagation();toggleSelect(order.id);}}>
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
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Aucune commande pour le moment</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 