import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Champs du formulaire
  const [customerName, setCustomerName] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [zipCode, setZipCode] = React.useState('');
  const [city, setCity] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Préparer le payload pour l'API
    const orderPayload = {
      customerName,
      customerEmail,
      customerPhone,
      address,
      zipCode,
      city,
      items: items.map(({ product, quantity, size }) => ({
        productId: product.id,
        quantity,
        size,
      }))
    };

    try {
      setIsSubmitting(true);
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        console.error(await res.text());
        throw new Error('Erreur réseau');
      }

      const data = await res.json();
      alert(`Commande validée ! Numéro : ${data.id}`);
    clearCart();
    navigate('/public/shops');
    } catch (err) {
      alert("Une erreur est survenue lors de la création de la commande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rediriger vers la liste des boutiques si le panier est vide
  React.useEffect(() => {
    if (items.length === 0) {
      navigate('/public/shops');
    }
  }, [items, navigate]);

  // champs form init after auth
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
      setAddress(user.address || '');
      setZipCode(user.zipCode || '');
      setCity(user.city || '');
    }
  }, [isAuthenticated, user]);

  if (items.length === 0) {
    return null; // la redirection est gérée dans le useEffect ci-dessus
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-nolt-orange hover:text-nolt-yellow transition-colors font-montserrat"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </button>

        <h1 className="font-thunder text-4xl mb-8 italic uppercase text-nolt-black">Finaliser la commande 🎯</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Formulaire */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations personnelles */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="font-thunder text-2xl mb-4 italic uppercase text-nolt-orange">Informations personnelles</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montserrat">Nom</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montserrat">Email</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montserrat">Téléphone</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Adresse de livraison */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="font-thunder text-2xl mb-4 italic uppercase text-nolt-orange">Adresse de livraison</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montserrat">Adresse</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-montserrat">Code postal</label>
                      <input
                        type="text"
                        required
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-montserrat">Ville</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Paiement */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="font-thunder text-2xl mb-4 italic uppercase text-nolt-orange">Paiement</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montserrat">Numéro de carte</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-montserrat">Date d'expiration</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-montserrat">CVC</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-nolt-orange py-4 font-semibold text-white hover:bg-nolt-yellow hover:text-nolt-black transition-colors font-montserrat disabled:opacity-60"
              >
                {isSubmitting ? 'Validation…' : `Valider ${total.toFixed(2)}€`}
              </button>
            </form>
          </div>

          {/* Récapitulatif */}
          <div className="space-y-8">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-thunder text-2xl mb-4 italic uppercase text-nolt-orange">Récapitulatif</h2>
              <div className="space-y-4">
                {items.map(({ product, quantity, size }) => (
                  <div key={`${product.id}-${size || 'nosize'}`} className="flex items-center gap-4">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.label}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold font-montserrat">{product.label}</h3>
                      <p className="text-sm text-gray-500 font-montserrat">Quantité : {quantity}</p>
                      {size && (
                        <p className="text-sm text-gray-500 font-montserrat">Taille : {size}</p>
                      )}
                    </div>
                    <span className="font-semibold font-montserrat text-nolt-orange">
                      {(product.price * quantity).toFixed(2)}€
                    </span>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="font-montserrat">Total</span>
                    <span className="text-nolt-yellow font-thunder italic text-xl">{total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Avantages */}
            <div className="rounded-xl bg-gray-50 p-6 border border-gray-200">
              <h2 className="font-thunder text-2xl mb-4 italic uppercase text-nolt-orange">Nos garanties</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-6 w-6 text-nolt-yellow" />
                  <div>
                    <h3 className="font-semibold font-montserrat">Livraison rapide</h3>
                    <p className="text-sm text-gray-600 font-montserrat">Livraison en 2-3 jours ouvrés</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-nolt-yellow" />
                  <div>
                    <h3 className="font-semibold font-montserrat">Paiement sécurisé</h3>
                    <p className="text-sm text-gray-600 font-montserrat">Vos données sont protégées</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-nolt-yellow" />
                  <div>
                    <h3 className="font-semibold font-montserrat">Satisfait ou remboursé</h3>
                    <p className="text-sm text-gray-600 font-montserrat">Retour gratuit sous 30 jours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}