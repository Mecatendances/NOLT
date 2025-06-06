import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { campaignApi } from '../../../services/api';

export function ShopAdminCampaigns() {
  const { id: shopId } = useParams();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', description: '' });

  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['campaigns', shopId],
    queryFn: async () => campaignApi.getCampaigns(shopId),
    enabled: !!shopId
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return campaignApi.createCampaign({ ...data, shopId });
    },
    onSuccess: () => {
      setIsCreating(false);
      setNewCampaign({ name: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['campaigns', shopId] });
    }
  });

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewCampaign({ ...newCampaign, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    if (!newCampaign.name) return;
    createMutation.mutate(newCampaign);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
        return campaignApi.deleteCampaign(id);
      }
      throw new Error('Suppression annulée');
    },
    onSuccess: () => {
      setSelectedCampaign(null);
      queryClient.invalidateQueries({ queryKey: ['campaigns', shopId] });
    }
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-thunder text-3xl text-nolt-black">Campagnes de la boutique</h1>
        <button
          className="px-4 py-2 bg-nolt-yellow rounded-lg font-montserrat hover:bg-nolt-yellow/90 transition-colors"
          onClick={() => setIsCreating(true)}
        >
          Créer une campagne
        </button>
      </div>

      {/* Formulaire de création */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="font-thunder text-xl mb-4">Nouvelle campagne</h2>
          <input
            className="border rounded-lg px-4 py-2 w-full mb-3 focus:ring-2 focus:ring-nolt-yellow focus:border-transparent"
            name="name"
            value={newCampaign.name}
            onChange={handleCreateChange}
            placeholder="Nom de la campagne"
          />
          <textarea
            className="border rounded-lg px-4 py-2 w-full mb-3 focus:ring-2 focus:ring-nolt-yellow focus:border-transparent"
            name="description"
            value={newCampaign.description}
            onChange={handleCreateChange}
            placeholder="Description"
          />
          <div className="flex gap-3">
            <button 
              className="px-6 py-2 bg-nolt-yellow rounded-lg hover:bg-nolt-yellow/90 transition-colors" 
              onClick={handleCreate}
            >
              Créer
            </button>
            <button 
              className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors" 
              onClick={() => setIsCreating(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {isLoading && <div className="text-center py-8">Chargement...</div>}
      {error && <div className="text-red-500 text-center py-8">Erreur lors du chargement des campagnes</div>}
      {(!isLoading && campaigns.length === 0) && (
        <div className="text-gray-500 text-center py-8">Aucune campagne pour cette boutique</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c: any) => (
          <div 
            key={c.id} 
            className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setSelectedCampaign(c)}
          >
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-2">{c.name}</h3>
                {c.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{c.description}</p>
                )}
                <div className="text-sm text-gray-500">
                  {c.orders?.length || 0} commande{c.orders?.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  <button 
                    className="text-red-500 hover:text-red-600 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c.id);
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de détail de la campagne */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-thunder text-2xl mb-2">{selectedCampaign.name}</h2>
                  {selectedCampaign.description && (
                    <p className="text-gray-600">{selectedCampaign.description}</p>
                  )}
                </div>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedCampaign(null)}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {selectedCampaign.orders?.map((order: any) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">Commande #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{order.totalTtc}€</div>
                        <div className="text-sm text-gray-500">{order.status}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-3">Produits commandés</h4>
                      <div className="space-y-3">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{item.product?.label}</div>
                              <div className="text-sm text-gray-500">
                                Taille {item.size}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{item.quantity} unité{item.quantity > 1 ? 's' : ''}</div>
                              <div className="text-sm text-gray-500">
                                {item.priceTtc}€ l'unité
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 