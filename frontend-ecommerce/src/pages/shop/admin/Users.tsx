import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../../../services/api';
import { ShopRole } from '../../../types/shop';

export function ShopAdminUsers() {
  const { id: shopId } = useParams();
  const queryClient = useQueryClient();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<ShopRole>('SHOP_CLIENT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Charger les membres locaux
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['shop-users', shopId],
    queryFn: () => shopApi.getShopUsers(shopId!),
    enabled: !!shopId,
  });

  // 2. Ajouter un utilisateur local (par email)
  const addUserMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string, role: ShopRole }) => {
      setLoading(true);
      setError(null);
      // On suppose que l'API permet d'ajouter par email (sinon il faut d'abord chercher l'userId)
      const user = await shopApi.findOrCreateUserByEmail(email);
      await shopApi.assignShopRole(shopId!, user.id, role);
      setLoading(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-users', shopId] });
      setNewUserEmail('');
      setNewUserRole('SHOP_CLIENT');
    },
    onError: (err: any) => {
      setError(err.message || "Erreur lors de l'ajout");
      setLoading(false);
    }
  });

  // 3. Modifier le rôle d'un utilisateur
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: ShopRole }) => {
      await shopApi.assignShopRole(shopId!, userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-users', shopId] });
    }
  });

  // 4. Supprimer un utilisateur local
  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await shopApi.removeShopUser(shopId!, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-users', shopId] });
    }
  });

  const inviteLink = `${window.location.origin}/register?shopId=${shopId}`;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-thunder text-3xl text-nolt-black mb-6">Utilisateurs de la boutique</h1>
      <div className="mb-8">
        <label className="font-montserrat">Lien d'invitation à partager :</label>
        <div className="flex gap-2 items-center mt-1">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="border rounded px-2 py-1 flex-1"
            onFocus={e => e.target.select()}
          />
          <button
            className="px-3 py-1 bg-nolt-orange text-white rounded"
            onClick={() => navigator.clipboard.writeText(inviteLink)}
            type="button"
          >
            Copier
          </button>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="font-montserrat text-lg mb-2">Ajouter un utilisateur</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            addUserMutation.mutate({ email: newUserEmail, role: newUserRole });
          }}
          className="flex gap-2 items-end"
        >
          <input
            type="email"
            required
            placeholder="Email de l'utilisateur"
            value={newUserEmail}
            onChange={e => setNewUserEmail(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
          />
          <select
            value={newUserRole}
            onChange={e => setNewUserRole(e.target.value as ShopRole)}
            className="border rounded px-3 py-2"
          >
            <option value="SHOP_ADMIN">Admin</option>
            <option value="SHOP_LICENSEE">Licencié</option>
            <option value="SHOP_COACH">Coach</option>
            <option value="SHOP_CLIENT">Client</option>
          </select>
          <button
            type="submit"
            className="bg-nolt-orange text-white px-4 py-2 rounded hover:bg-nolt-yellow"
            disabled={loading}
          >
            Ajouter
          </button>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
      <h2 className="font-montserrat text-lg mb-2">Membres actuels</h2>
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <table className="w-full border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Rôle</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m: any) => (
              <tr key={m.user.id} className="border-t">
                <td className="p-2">{m.user.name || '-'}</td>
                <td className="p-2">{m.user.email}</td>
                <td className="p-2">
                  <select
                    value={m.role}
                    onChange={e => updateRoleMutation.mutate({ userId: m.user.id, role: e.target.value as ShopRole })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="SHOP_ADMIN">Admin</option>
                    <option value="SHOP_LICENSEE">Licencié</option>
                    <option value="SHOP_COACH">Coach</option>
                    <option value="SHOP_CLIENT">Client</option>
                  </select>
                </td>
                <td className="p-2">
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => removeUserMutation.mutate(m.user.id)}
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 