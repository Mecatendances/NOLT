import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react';

export function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler une commande réussie
    alert('Commande validée ! Merci de votre achat.');
    clearCart();
    navigate('/public/shops');
  };

  if (items.length === 0) {
    navigate('/public/shops');
    return null;
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
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montserrat">Email</label>
                    <input
                      type="email"
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-montserrat">Téléphone</label>
                    <input
                      type="tel"
                      required
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
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-montserrat">Code postal</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 font-montserrat focus:ring-2 focus:ring-nolt-yellow focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-montserrat">Ville</label>
                      <input
                        type="text"
                        required
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
                className="w-full rounded-xl bg-nolt-orange py-4 font-semibold text-white hover:bg-nolt-yellow hover:text-nolt-black transition-colors font-montserrat"
              >
                Payer {total.toFixed(2)}€
              </button>
            </form>
          </div>

          {/* Récapitulatif */}
          <div className="space-y-8">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="font-thunder text-2xl mb-4 italic uppercase text-nolt-orange">Récapitulatif</h2>
              <div className="space-y-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-4">
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