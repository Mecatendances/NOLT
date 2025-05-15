import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../services/api';
import { Download, User, Mail, Phone, MapPin, Building2, Package, ShoppingBag, Crown, Store } from 'lucide-react';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'SENT':
      return 'bg-blue-100 text-blue-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'SUPERADMIN':
      return { color: 'bg-purple-100 text-purple-800', icon: <Crown className="h-4 w-4" />, label: 'Super Admin' };
    case 'ADMIN':
      return { color: 'bg-blue-100 text-blue-800', icon: <Crown className="h-4 w-4" />, label: 'Admin' };
    case 'LICENSEE':
      return { color: 'bg-nolt-orange/10 text-nolt-orange', icon: <Store className="h-4 w-4" />, label: 'Licencié' };
    default:
      return { color: 'bg-gray-100 text-gray-800', icon: <User className="h-4 w-4" />, label: 'Client' };
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function Profile() {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: userApi.getMyOrders,
  });

  if (!user) return null;

  const initialForm = React.useMemo(() => ({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    zipCode: user.zipCode || '',
    city: user.city || '',
    preferredClub: user.preferredClub || '',
  }), [user]);

  const [form, setForm] = React.useState(initialForm);
  const [editMode, setEditMode] = React.useState(false);

  const save = async () => {
    await userApi.updateMe(form);
    location.reload();
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-thunder italic text-nolt-orange">Mon profil</h1>
        <div className="flex items-center gap-2">
          {roleBadge.icon}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleBadge.color}`}>
            {roleBadge.label}
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-10 border border-gray-200 hover:border-nolt-yellow transition-all duration-300">
        <h2 className="text-2xl font-thunder italic mb-6 text-nolt-black">Mes informations</h2>
        {editMode ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-nolt-orange" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nom"
                  className="flex-1 p-2 border rounded-lg focus:border-nolt-yellow focus:ring-1 focus:ring-nolt-yellow outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-nolt-orange" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email"
                  className="flex-1 p-2 border rounded-lg focus:border-nolt-yellow focus:ring-1 focus:ring-nolt-yellow outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-nolt-orange" />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Téléphone"
                  className="flex-1 p-2 border rounded-lg focus:border-nolt-yellow focus:ring-1 focus:ring-nolt-yellow outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-nolt-orange" />
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Adresse"
                  className="flex-1 p-2 border rounded-lg focus:border-nolt-yellow focus:ring-1 focus:ring-nolt-yellow outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-nolt-orange" />
                <input
                  type="text"
                  value={form.preferredClub}
                  onChange={(e) => setForm({ ...form, preferredClub: e.target.value })}
                  placeholder="Club préféré"
                  className="flex-1 p-2 border rounded-lg focus:border-nolt-yellow focus:ring-1 focus:ring-nolt-yellow outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={save} 
                className="px-6 py-2 bg-nolt-orange text-white rounded-lg hover:bg-nolt-yellow transition-colors font-montserrat"
              >
                Enregistrer
              </button>
              <button 
                onClick={() => setEditMode(false)} 
                className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-montserrat"
              >
                Annuler
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-nolt-orange" />
                <p className="font-montserrat"><span className="font-medium">Nom&nbsp;:</span> {user.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-nolt-orange" />
                <p className="font-montserrat"><span className="font-medium">Email&nbsp;:</span> {user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-nolt-orange" />
                <p className="font-montserrat"><span className="font-medium">Téléphone&nbsp;:</span> {user.phone || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-nolt-orange" />
                <p className="font-montserrat">
                  <span className="font-medium">Adresse&nbsp;:</span> {user.address || '-'}
                  {user.zipCode && user.city && `, ${user.zipCode} ${user.city}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-nolt-orange" />
                <p className="font-montserrat"><span className="font-medium">Club préféré&nbsp;:</span> {user.preferredClub || '-'}</p>
              </div>
              {user.role === 'LICENSEE' && user.licenseeShops && (
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-nolt-orange" />
                  <p className="font-montserrat">
                    <span className="font-medium">Boutiques gérées&nbsp;:</span> {user.licenseeShops.join(', ')}
                  </p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setEditMode(true)} 
              className="mt-6 px-6 py-2 bg-nolt-orange text-white rounded-lg hover:bg-nolt-yellow transition-colors font-montserrat"
            >
              Modifier
            </button>
          </>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-nolt-yellow transition-all duration-300">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="h-6 w-6 text-nolt-orange" />
          <h2 className="text-2xl font-thunder italic text-nolt-black">Mes commandes</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-nolt-orange"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="font-montserrat text-gray-500">Aucune commande pour l'instant.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o: any) => (
              <div key={o.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-nolt-yellow transition-all duration-300">
                <div className="bg-gray-50 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-gray-500">#{o.id.slice(0,8)}</span>
                    <span className="font-montserrat text-sm">{formatDate(o.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-thunder italic text-nolt-yellow text-lg">{Number(o.totalTtc).toFixed(2)}€</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium font-montserrat ${getStatusColor(o.status)}`}>
                      {o.status === 'PAID' ? 'Payée' : 
                       o.status === 'SENT' ? 'Expédiée' :
                       o.status === 'CANCELLED' ? 'Annulée' : 'En attente'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <details className="flex-1 cursor-pointer">
                      <summary className="text-nolt-orange hover:text-nolt-yellow font-montserrat">Voir les articles</summary>
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="p-2 text-left font-montserrat">Produit</th>
                              <th className="p-2 text-left font-montserrat">Taille</th>
                              <th className="p-2 text-right font-montserrat">Quantité</th>
                              <th className="p-2 text-right font-montserrat">Prix unitaire</th>
                              <th className="p-2 text-right font-montserrat">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items.map((item: any) => (
                              <tr key={item.id} className="border-b last:border-0">
                                <td className="p-2 font-montserrat">{item.product.name}</td>
                                <td className="p-2 font-montserrat">{item.size}</td>
                                <td className="p-2 text-right font-montserrat">{item.quantity}</td>
                                <td className="p-2 text-right font-montserrat">{Number(item.unitPriceTtc).toFixed(2)}€</td>
                                <td className="p-2 text-right font-thunder italic text-nolt-yellow">{(Number(item.unitPriceTtc) * item.quantity).toFixed(2)}€</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                    {o.status === 'PAID' && (
                      <button 
                        className="p-2 text-gray-600 hover:text-nolt-orange transition-colors rounded-lg hover:bg-gray-50"
                        title="Télécharger la facture"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 