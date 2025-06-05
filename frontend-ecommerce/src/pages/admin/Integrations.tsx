import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PROVIDERS = [
  { value: 'stripe', label: 'Stripe (Paiement)' },
  { value: 'paypal', label: 'PayPal (Paiement)' },
  { value: 'mollie', label: 'Mollie (Paiement)' },
  { value: 'google-analytics', label: 'Google Analytics' },
  { value: 'matomo', label: 'Matomo' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

function getFieldsForProvider(provider: string) {
  switch (provider) {
    case 'stripe':
      return ['apiKey', 'webhookSecret'];
    case 'paypal':
      return ['clientId', 'clientSecret'];
    case 'mollie':
      return ['apiKey'];
    case 'google-analytics':
      return ['trackingId'];
    case 'matomo':
      return ['trackingId'];
    case 'facebook':
      return ['pageId', 'accessToken'];
    case 'instagram':
      return ['accessToken'];
    case 'whatsapp':
      return ['phoneNumber', 'accessToken'];
    default:
      return [];
  }
}

export function IntegrationsAdmin() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ provider: 'stripe' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/integrations')
      .then(res => setIntegrations(res.data))
      .catch(() => setError('Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (integration: any) => {
    setEditing(integration);
    setForm({ ...integration });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette intégration ?')) return;
    await axios.delete(`/api/admin/integrations/${id}`);
    setIntegrations(integrations.filter(i => i.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const res = await axios.put(`/api/admin/integrations/${editing.id}`, form);
        setIntegrations(integrations.map(i => i.id === editing.id ? res.data : i));
        setEditing(null);
      } else {
        const res = await axios.post('/api/admin/integrations', form);
        setIntegrations([...integrations, res.data]);
      }
      setForm({ provider: 'stripe' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-thunder mb-6">Intégrations</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block mb-1 font-montserrat">Type d'intégration</label>
          <select
            name="provider"
            value={form.provider}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            disabled={!!editing}
          >
            {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        {getFieldsForProvider(form.provider).map(field => (
          <div key={field}>
            <label className="block mb-1 font-montserrat">{field}</label>
            <input
              type="text"
              name={field}
              value={form[field] || ''}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        ))}
        {error && <div className="text-red-500 font-montserrat">{error}</div>}
        <button
          type="submit"
          className="bg-nolt-orange text-white px-4 py-2 rounded hover:bg-nolt-yellow"
          disabled={saving}
        >
          {editing ? 'Mettre à jour' : 'Ajouter'}
        </button>
        {editing && (
          <button
            type="button"
            className="ml-2 px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
            onClick={() => { setEditing(null); setForm({ provider: 'stripe' }); }}
          >
            Annuler
          </button>
        )}
      </form>
      <h2 className="font-montserrat text-lg mb-2">Intégrations existantes</h2>
      {loading ? <div>Chargement...</div> : (
        <table className="w-full border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Champs</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-2">{PROVIDERS.find(p => p.value === i.provider)?.label || i.provider}</td>
                <td className="p-2">
                  {getFieldsForProvider(i.provider).map(f => (
                    <div key={f}><span className="font-semibold">{f}</span> : {i[f]}</div>
                  ))}
                </td>
                <td className="p-2">
                  <button
                    className="text-blue-600 hover:underline mr-2"
                    onClick={() => handleEdit(i)}
                  >
                    Modifier
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDelete(i.id)}
                  >
                    Supprimer
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