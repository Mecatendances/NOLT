import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, AlertTriangle, Plus, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { orderApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
  };
  quantity: number;
  size: string;
  unitPriceTtc: number;
  totalPriceTtc: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Shop {
  id: string;
  name: string;
}

interface Order {
  id: string;
  user: User;
  shop: Shop;
  items: OrderItem[];
  totalTtc: number;
  status: string;
  createdAt: string;
  campaign?: {
    id: string;
    name: string;
  };
}

export function OrdersList() {
  const navigate = useNavigate();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedShops, setExpandedShops] = useState<Record<string, boolean>>({});

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: () => orderApi.getAdminOrders()
  });

  const handleToggleOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleAddToCampaign = async () => {
    if (selectedOrders.length === 0) return;

    const campaignName = prompt('Nom de la campagne :');
    if (!campaignName) return;

    try {
      const campaign = await orderApi.createCampaign(campaignName);
      await orderApi.addOrdersToCampaign(campaign.id, selectedOrders);
      setSelectedOrders([]);
    } catch (error) {
      console.error('Erreur lors de la création de la campagne:', error);
      alert('Erreur lors de la création de la campagne');
    }
  };

  const toggleShop = (shopId: string) => {
    setExpandedShops(prev => ({
      ...prev,
      [shopId]: !prev[shopId]
    }));
  };

  const ordersByShop = useMemo(() => {
    if (!orders) return {};
    
    const filteredOrders = orders.filter(order => 
      order.shop.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredOrders.reduce((acc, order) => {
      if (!acc[order.shop.id]) {
        acc[order.shop.id] = {
          shop: order.shop,
          orders: []
        };
      }
      acc[order.shop.id].orders.push(order);
      return acc;
    }, {} as Record<string, { shop: Shop; orders: Order[] }>);
  }, [orders, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <p>Une erreur est survenue lors du chargement des commandes</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'PAID':
        return 'Payée';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Commandes</h1>
        {selectedOrders.length > 0 && (
          <button
            onClick={handleAddToCampaign}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Ajouter à une campagne ({selectedOrders.length})
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher une boutique..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      {Object.values(ordersByShop).map(({ shop, orders }) => (
        <div key={shop.id} className="bg-white rounded-lg shadow">
          <div 
            className="p-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => toggleShop(shop.id)}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{shop.name}</h2>
              <span className="text-sm text-gray-500">({orders.length} commandes)</span>
            </div>
            {expandedShops[shop.id] ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
          
          {expandedShops[shop.id] && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Client</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Statut</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Campagne</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Sélection</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr 
                      key={order.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      <td className="px-4 py-2 text-sm">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {order.user.firstName} {order.user.lastName}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {Number(order.totalTtc ?? 0).toFixed(2)} €
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {order.campaign?.name || '-'}
                      </td>
                      <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleToggleOrder(order.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 