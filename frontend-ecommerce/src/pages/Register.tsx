import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shopId');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !name || !password || !confirm) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/users', { email, name, password, shopId });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-16">
      <h1 className="text-2xl font-thunder mb-6">Créer un compte</h1>
      {success ? (
        <div className="text-green-600 font-montserrat">Compte créé avec succès. Redirection...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-montserrat">Nom</label>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-montserrat">Email</label>
            <input
              type="email"
              className="border rounded px-3 py-2 w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-montserrat">Mot de passe</label>
            <input
              type="password"
              className="border rounded px-3 py-2 w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block mb-1 font-montserrat">Confirmer le mot de passe</label>
            <input
              type="password"
              className="border rounded px-3 py-2 w-full"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error && <div className="text-red-500 font-montserrat">{error}</div>}
          <button
            type="submit"
            className="bg-nolt-orange text-white px-4 py-2 rounded hover:bg-nolt-yellow"
            disabled={loading}
          >
            Créer mon compte
          </button>
        </form>
      )}
    </div>
  );
} 