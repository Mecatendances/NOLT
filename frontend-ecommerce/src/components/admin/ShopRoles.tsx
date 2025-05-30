import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { ShopRole } from '../../types/userRole';
import { User } from '../../types/auth';

interface ShopRoleAssignment {
  userId: string;
  role: ShopRole;
}

export function ShopRoles() {
  const { shopId } = useParams<{ shopId: string }>();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<ShopRole>(ShopRole.SHOP_CLIENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [shopId]);

  const loadUsers = async () => {
    try {
      const response = await api.get(`/shops/${shopId}/roles`);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser) return;

    try {
      await api.post(`/shops/${shopId}/roles`, {
        userId: selectedUser,
        role: selectedRole
      });
      await loadUsers();
      setSelectedUser('');
    } catch (err) {
      setError('Erreur lors de l\'attribution du rôle');
    }
  };

  const handleRemoveRole = async (userId: string) => {
    try {
      await api.delete(`/shops/${shopId}/roles/user/${userId}`);
      await loadUsers();
    } catch (err) {
      setError('Erreur lors de la suppression du rôle');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Gestion des rôles de boutique</h2>
      
      {/* Formulaire d'attribution de rôle */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Attribuer un rôle</h3>
        <div className="flex gap-4">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="flex-1 p-2 border rounded"
          >
            <option value="">Sélectionner un utilisateur</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as ShopRole)}
            className="flex-1 p-2 border rounded"
          >
            {Object.values(ShopRole).map(role => (
              <option key={role} value={role}>
                {role.replace('SHOP_', '')}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleAssignRole}
            disabled={!selectedUser}
            className="px-4 py-2 bg-nolt-orange text-white rounded hover:bg-nolt-orange/90 disabled:opacity-50"
          >
            Attribuer
          </button>
        </div>
      </div>

      {/* Liste des rôles actuels */}
      <div className="bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold p-4 border-b">Rôles actuels</h3>
        <div className="divide-y">
          {users.map(user => (
            <div key={user.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {user.role}
                </span>
                <button
                  onClick={() => handleRemoveRole(user.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 