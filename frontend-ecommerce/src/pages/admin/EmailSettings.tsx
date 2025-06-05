import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PROVIDERS = [
  { value: 'office365', label: 'Office 365' },
  { value: 'brevo', label: 'Brevo (Sendinblue)' },
];

export function EmailSettingsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<any>({ provider: 'office365' });

  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/email-settings')
      .then(res => setSettings(res.data || { provider: 'office365' }))
      .catch(() => setError('Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await axios.put('/api/admin/email-settings', settings);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-xl py-10">
      <h1 className="text-2xl font-thunder mb-6">Paramètres d'envoi des emails</h1>
      {loading ? <div>Chargement...</div> : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-montserrat">Fournisseur d'email</label>
            <select
              name="provider"
              value={settings.provider}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            >
              {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          {settings.provider === 'office365' && (
            <>
              <div>
                <label className="block mb-1 font-montserrat">Client ID</label>
                <input type="text" name="officeClientId" value={settings.officeClientId || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block mb-1 font-montserrat">Client Secret</label>
                <input type="text" name="officeClientSecret" value={settings.officeClientSecret || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block mb-1 font-montserrat">Tenant ID</label>
                <input type="text" name="officeTenantId" value={settings.officeTenantId || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block mb-1 font-montserrat">Expéditeur (email)</label>
                <input type="email" name="officeSender" value={settings.officeSender || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
              </div>
            </>
          )}
          {settings.provider === 'brevo' && (
            <>
              <div>
                <label className="block mb-1 font-montserrat">API Key</label>
                <input type="text" name="brevoApiKey" value={settings.brevoApiKey || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block mb-1 font-montserrat">Expéditeur (email)</label>
                <input type="email" name="brevoSender" value={settings.brevoSender || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
              </div>
            </>
          )}
          {error && <div className="text-red-500 font-montserrat">{error}</div>}
          {success && <div className="text-green-600 font-montserrat">Paramètres sauvegardés !</div>}
          <button
            type="submit"
            className="bg-nolt-orange text-white px-4 py-2 rounded hover:bg-nolt-yellow"
            disabled={saving}
          >
            Sauvegarder
          </button>
        </form>
      )}
    </div>
  );
} 