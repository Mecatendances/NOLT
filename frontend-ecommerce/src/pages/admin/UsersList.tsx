import React, { useEffect, useState } from 'react';
import { api, userShopRoleApi } from '../../services/api';
import { GlobalRole, ShopRole } from '../../types/userRole';
import { useAuth } from '../../contexts/AuthContext';
import { Shop } from '../../types/shop';

interface User {
  id: string;
  email: string;
  name?: string;
  role: GlobalRole;
}

interface UserShopRole {
  user: User;
  shop: Shop;
  role: ShopRole;
}

export function AdminUsersList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userShopRoles, setUserShopRoles] = useState<UserShopRole[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoteUserId, setPromoteUserId] = useState<string>('');
  const [promoteShopId, setPromoteShopId] = useState<string>('');
  const [promoteLoading, setPromoteLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [usersRes, userShopRolesRes, shopsRes] = await Promise.all([
          api.get('/users'),
          userShopRoleApi.getAllUserShopRoles(),
          api.get('/shops'),
        ]);
        setUsers(usersRes.data);
        setUserShopRoles(userShopRolesRes);
        setShops(shopsRes.data);
      } catch (e) {
        setError("Erreur lors du chargement des utilisateurs ou rôles locaux");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleRoleChange = async (userId: string, newRole: GlobalRole) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) {
      setError("Erreur lors de la modification du rôle");
    }
  };

  const handlePromote = async () => {
    if (!promoteUserId || !promoteShopId) return;
    setPromoteLoading(true);
    try {
      await api.post(`/shops/${promoteShopId}/roles`, {
        userId: promoteUserId,
        role: ShopRole.SHOP_ADMIN,
      });
      // Refresh roles
      const userShopRolesRes = await userShopRoleApi.getAllUserShopRoles();
      setUserShopRoles(userShopRolesRes);
      setPromoteUserId('');
      setPromoteShopId('');
    } catch (e) {
      setError("Erreur lors de la promotion de l'utilisateur");
    } finally {
      setPromoteLoading(false);
    }
  };

  if (!user || user.role !== GlobalRole.SUPERADMIN) {
    return <div className="p-8">Accès réservé au Super Admin.</div>;
  }

  if (loading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // Regrouper les rôles locaux par utilisateur
  const userRolesMap: Record<string, { shop: Shop; role: ShopRole }[]> = {};
  userShopRoles.forEach((usr) => {
    if (!usr.user?.id) return;
    if (!userRolesMap[usr.user.id]) userRolesMap[usr.user.id] = [];
    userRolesMap[usr.user.id].push({ shop: usr.shop, role: usr.role });
  });

  return (
    <div className="p-8">
      <h1 className="font-thunder text-2xl mb-6">Gestion des utilisateurs</h1>
      <div className="mb-6 p-4 bg-white rounded-lg shadow flex items-center gap-4">
        <span className="font-semibold">Promouvoir admin sur une boutique :</span>
        <select
          value={promoteUserId}
          onChange={e => setPromoteUserId(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Sélectionner un utilisateur</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name || u.email}</option>
          ))}
        </select>
        <select
          value={promoteShopId}
          onChange={e => setPromoteShopId(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Sélectionner une boutique</option>
          {shops.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button
          onClick={handlePromote}
          disabled={!promoteUserId || !promoteShopId || promoteLoading}
          className="px-4 py-2 bg-nolt-orange text-white rounded hover:bg-nolt-orange/90 disabled:opacity-50"
        >
          Promouvoir admin
        </button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Nom</th>
            <th className="px-4 py-2 border">Rôle global</th>
            <th className="px-4 py-2 border">Boutiques & rôles locaux</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="px-4 py-2 border">{u.email}</td>
              <td className="px-4 py-2 border">{u.name || '-'}</td>
              <td className="px-4 py-2 border">{u.role}</td>
              <td className="px-4 py-2 border">
                {userRolesMap[u.id]?.length ? (
                  <ul>
                    {userRolesMap[u.id].map(({ shop, role }) => (
                      <li key={shop.id}>
                        <span className="font-semibold">{shop.name}</span> : <span>{role.replace('SHOP_', '')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">Aucun rôle local</span>
                )}
              </td>
              <td className="px-4 py-2 border">
                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u.id, e.target.value as GlobalRole)}
                  className="border rounded px-2 py-1"
                >
                  {Object.values(GlobalRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 