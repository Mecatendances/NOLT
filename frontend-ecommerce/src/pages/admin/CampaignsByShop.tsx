import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { campaignApi } from '../../services/api';

interface Order {
  id: string;
  totalTtc: number;
  status: string;
  createdAt: string;
  items: any[];
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalTtc: number;
  createdAt: string;
  updatedAt: string;
  ordersCount: number;
  orders: Order[];
  products: any[];
}

interface ShopCampaigns {
  shop: {
    id: string;
    name: string;
    slug: string;
  };
  campaigns: Campaign[];
}

export function CampaignsByShop() {
  const { data, isLoading, error } = useQuery<ShopCampaigns[]>({
    queryKey: ['admin-campaigns-by-shop'],
    queryFn: () => campaignApi.getCampaignsByShop(),
  });

  if (isLoading) return <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Chargement...</div>;
  if (error) return <div className="flex items-center gap-2 text-red-600"><AlertTriangle /> Impossible de charger</div>;

  return (
    <div>
      <h1 className="text-2xl font-thunder text-nolt-black mb-6">Campagnes par boutique</h1>
      {data && data.map((shopCampaigns) => (
        <div key={shopCampaigns.shop.id} className="mb-8">
          <h2 className="text-xl font-thunder text-nolt-orange mb-4">{shopCampaigns.shop.name}</h2>
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
                {shopCampaigns.campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b last:border-none hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-nolt-orange">{campaign.name}</td>
                    <td className="px-4 py-3">{format(new Date(campaign.createdAt), 'dd MMM yyyy', { locale: fr })}</td>
                    <td className="px-4 py-3">{campaign.ordersCount}</td>
                    <td className="px-4 py-3">{Number(campaign.totalTtc).toFixed(2)} €</td>
                    <td className="px-4 py-3">{campaign.status}</td>
                  </tr>
                ))}
                {shopCampaigns.campaigns.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucune campagne</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
} 