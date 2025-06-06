import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Search } from 'lucide-react';
import { orderApi, campaignApi } from '../../../services/api';

interface OrderItem {
  id: number;
  product: {
    id: string;
    name: string;
  };
  quantity: number;
  size: string;
  unitPriceTtc: number;
}

interface Order {
  id: string;
  user: {
    id: string;
    email: string;
  };
  items: OrderItem[];
  totalTtc: number;
  status: 'PENDING' | 'PAID' | 'SENT' | 'CANCELLED';
  createdAt: string;
  campaign?: {
    id: string;
    name: string;
  };
}

export function ShopAdminOrders() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders', id],
    queryFn: () => orderApi.getOrders(id!),
    enabled: !!id
  });

  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const all = await campaignApi.getCampaigns();
      return all.filter((c: any) => c.shopId === id);
    },
    enabled: !!id
  });

  const assignCampaignMutation = useMutation({
    mutationFn: ({ orderId, campaignId }: { orderId: string; campaignId: string | null }) =>
      orderApi.assignCampaign(orderId, campaignId, id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      setSelectedOrders([]);
    },
  });

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleAssignCampaign = (campaignId: string | null) => {
    selectedOrders.forEach(orderId => {
      assignCampaignMutation.mutate({ orderId, campaignId });
    });
  };

  // Filtrage des commandes selon la recherche (par id ou email)
  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    const searchLower = search.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-nolt-blue animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Une erreur est survenue lors du chargement des commandes.
        </div>
      </div>
    );
  }

  // Ajout debug : log des commandes reçues
  console.log('orders:', orders);
  if (Array.isArray(orders)) {
    orders.forEach((order, idx) => {
      console.log(`order[${idx}]`, order);
    });
  }

  // Gestion d'une erreur inattendue de format
  if (orders && !Array.isArray(orders)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 flex flex-col items-center">
          <AlertTriangle className="w-5 h-5 mb-2" />
          Erreur : le format des commandes reçues n'est pas valide.<br />
          <pre className="bg-gray-100 text-xs p-2 rounded mt-2 max-w-xl overflow-x-auto">{JSON.stringify(orders, null, 2)}</pre>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'PAID': return 'Payée';
      case 'SENT': return 'Expédiée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

  // Affichage simple des commandes de la boutique
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-thunder text-nolt-black mb-6">Commandes de la boutique</h1>
      {/* Widget de recherche moderne */}
      <div className="flex items-center mb-4 max-w-md">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par numéro de commande ou email client..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nolt-yellow transition"
          />
        </div>
      </div>
      <div className="overflow-x-auto bg-white shadow-sm rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campagne</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  navigate(`/shops/${id}/admin/orders/${order.id}`);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id ? order.id.slice(0, 8) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user?.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.totalTtc !== undefined && order.totalTtc !== null && !isNaN(Number(order.totalTtc)) ? Number(order.totalTtc).toFixed(2) + ' €' : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>{getStatusLabel(order.status) || '-'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <button
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        order.campaign 
                          ? 'bg-nolt-yellow text-black hover:bg-nolt-yellow/90' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={e => { e.stopPropagation(); setOpenOrderId(order.id === openOrderId ? null : order.id); }}
                    >
                      {order.campaign?.name || 'Aucune campagne'}
                      <svg 
                        className={`ml-2 w-4 h-4 transition-transform duration-200 ${openOrderId === order.id ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openOrderId === order.id && (
                      <div className="absolute z-10 mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-100 w-48 overflow-hidden">
                        <div className="py-1">
                          <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center"
                            onClick={e => { e.stopPropagation(); assignCampaignMutation.mutate({ orderId: order.id, campaignId: null }); setOpenOrderId(null); }}
                          >
                            <span className={`w-2 h-2 rounded-full mr-2 ${!order.campaign ? 'bg-nolt-yellow' : 'bg-gray-200'}`}></span>
                            Aucune campagne
                          </button>
                          {campaigns.map((c: any) => (
                            <button
                              key={c.id}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center"
                              onClick={e => { e.stopPropagation(); assignCampaignMutation.mutate({ orderId: order.id, campaignId: c.id }); setOpenOrderId(null); }}
                            >
                              <span className={`w-2 h-2 rounded-full mr-2 ${order.campaign?.id === c.id ? 'bg-nolt-yellow' : 'bg-gray-200'}`}></span>
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(!orders || !Array.isArray(orders) || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">Aucune commande trouvée pour cette boutique.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 