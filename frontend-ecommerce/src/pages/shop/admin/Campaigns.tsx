import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { campaignApi } from '../../../services/api';

export function ShopAdminCampaigns() {
  const { id: shopId } = useParams();
  const queryClient = useQueryClient();
  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['campaigns', shopId],
    queryFn: async () => {
      const all = await campaignApi.getCampaigns();
      // Filtrer les campagnes de la boutique courante
      return all.filter((c: any) => c.shop?.id === shopId);
    },
    enabled: !!shopId
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const updateMutation = useMutation({
    mutationFn: async (data: any) => campaignApi.updateCampaign(data.id, data),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['campaigns', shopId] });
    }
  });

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setEditData({ ...c });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  // Ajout pour la création de campagne
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', description: '' });
  const createMutation = useMutation({
    mutationFn: async (data: any) => campaignApi.createCampaign({ ...data, shopId }),
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

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-thunder text-3xl text-nolt-black mb-6">Campagnes de la boutique</h1>
      {/* Bouton de création */}
      <button
        className="mb-4 px-4 py-2 bg-nolt-yellow rounded font-montserrat"
        onClick={() => setIsCreating(true)}
      >
        Créer une campagne
      </button>
      {/* Formulaire de création */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-thunder text-xl mb-4">Nouvelle campagne</h2>
          <input
            className="border rounded px-2 py-1 w-full mb-2"
            name="name"
            value={newCampaign.name}
            onChange={handleCreateChange}
            placeholder="Nom de la campagne"
          />
          <textarea
            className="border rounded px-2 py-1 w-full mb-2"
            name="description"
            value={newCampaign.description}
            onChange={handleCreateChange}
            placeholder="Description"
          />
          <div className="flex gap-2">
            <button className="px-4 py-1 bg-nolt-yellow rounded" onClick={handleCreate}>Créer</button>
            <button className="px-4 py-1 bg-gray-200 rounded" onClick={() => setIsCreating(false)}>Annuler</button>
          </div>
        </div>
      )}
      {isLoading && <div>Chargement...</div>}
      {error && <div className="text-red-500">Erreur lors du chargement des campagnes</div>}
      {(!isLoading && campaigns.length === 0) && (
        <div className="text-gray-500">Aucune campagne pour cette boutique</div>
      )}
      <div className="space-y-4">
        {campaigns.map((c: any) => (
          <div key={c.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            {editingId === c.id ? (
              <div className="flex-1 space-y-2">
                <input
                  className="border rounded px-2 py-1 w-full mb-1"
                  name="name"
                  value={editData.name || ''}
                  onChange={handleChange}
                  placeholder="Nom de la campagne"
                />
                <textarea
                  className="border rounded px-2 py-1 w-full mb-1"
                  name="description"
                  value={editData.description || ''}
                  onChange={handleChange}
                  placeholder="Description"
                />
                <div className="flex gap-2 mb-1">
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    name="startDate"
                    value={editData.startDate ? editData.startDate.slice(0,10) : ''}
                    onChange={handleChange}
                  />
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    name="endDate"
                    value={editData.endDate ? editData.endDate.slice(0,10) : ''}
                    onChange={handleChange}
                  />
                  <select
                    className="border rounded px-2 py-1"
                    name="status"
                    value={editData.status || ''}
                    onChange={handleChange}
                  >
                    <option value="DRAFT">Brouillon</option>
                    <option value="PAID">Payée</option>
                    <option value="SENT">Envoyée</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-1 bg-nolt-yellow rounded" onClick={handleSave}>Sauvegarder</button>
                  <button className="px-4 py-1 bg-gray-200 rounded" onClick={() => setEditingId(null)}>Annuler</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="font-thunder text-xl text-nolt-black">{c.name}</div>
                  <div className="text-gray-500 text-sm">{c.description}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {c.startDate ? `Début : ${new Date(c.startDate).toLocaleDateString()}` : ''}
                    {c.endDate ? ` | Fin : ${new Date(c.endDate).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <div className="mt-2 md:mt-0 flex flex-col items-end gap-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-nolt-yellow text-nolt-black">
                    {c.status}
                  </span>
                  <button className="text-xs text-nolt-orange underline" onClick={() => handleEdit(c)}>Éditer</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 