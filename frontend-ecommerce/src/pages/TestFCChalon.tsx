import React, { useState } from 'react';
import { shopApi } from '../services/api';

export function TestFCChalon() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFcChalonProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Test de récupération des produits FC CHALON');
      
      // Test avec la méthode directe
      const products = await shopApi.getCategoryProductsViaDirect('183');
      console.log('📊 Produits FC CHALON:', products);
      setProducts(products);
    } catch (err: any) {
      console.error('❌ Erreur lors du test:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-6">Test API FC CHALON</h1>
      
      <button 
        onClick={testFcChalonProducts}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-8"
        disabled={loading}
      >
        {loading ? 'Chargement...' : 'Tester Produits FC CHALON'}
      </button>

      {error && (
        <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
          <h3 className="font-bold">Erreur :</h3>
          <p>{error}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Résultats ({products.length} produits) :</h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500">Aucun produit trouvé ou test non exécuté.</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Référence</th>
                  <th className="p-3 text-left">Nom</th>
                  <th className="p-3 text-left">Prix</th>
                  <th className="p-3 text-left">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="p-3">{product.id}</td>
                    <td className="p-3">{product.ref}</td>
                    <td className="p-3">{product.label}</td>
                    <td className="p-3">{product.price} €</td>
                    <td className="p-3">{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">Instructions :</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Cliquez sur le bouton "Tester Produits FC CHALON"</li>
          <li>Les résultats s'afficheront dans le tableau ci-dessus</li>
          <li>Consultez la console du navigateur pour plus de détails</li>
        </ol>
      </div>
    </div>
  );
} 