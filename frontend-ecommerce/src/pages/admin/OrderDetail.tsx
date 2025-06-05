import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { orderApi } from '../../services/api';

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

interface Order {
  id: string;
  user: User;
  items: OrderItem[];
  totalTtc: number;
  status: string;
  createdAt: string;
  campaign?: {
    id: string;
    name: string;
  };
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['admin-order', id],
    queryFn: () => orderApi.getAdminOrder(id!),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <p>Une erreur est survenue lors du chargement de la commande</p>
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/orders"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux commandes
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Commande #{order.id.slice(0, 8)}</h1>
              <p className="text-gray-600">
                {format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Informations client</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nom</p>
              <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{order.user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Articles commandés</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Produit</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Taille</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Quantité</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Prix unitaire</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item) => {
                  const unitPrice = Number(item.unitPriceTtc) || 0;
                  const quantity = Number(item.quantity) || 0;
                  const totalPrice = unitPrice * quantity;
                  
                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">{item.product.name}</td>
                      <td className="px-4 py-3 text-sm">{item.size}</td>
                      <td className="px-4 py-3 text-sm">{quantity}</td>
                      <td className="px-4 py-3 text-sm">{unitPrice.toFixed(2)} €</td>
                      <td className="px-4 py-3 text-sm">{totalPrice.toFixed(2)} €</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-right font-medium">Total</td>
                  <td className="px-4 py-3 font-medium">
                    {order.items.reduce((sum, item) => {
                      const unitPrice = Number(item.unitPriceTtc) || 0;
                      const quantity = Number(item.quantity) || 0;
                      return sum + (unitPrice * quantity);
                    }, 0).toFixed(2)} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 