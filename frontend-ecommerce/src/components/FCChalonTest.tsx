import React, { useState } from 'react';
import { shopApi } from '../services/api';

export const FCChalonTest: React.FC = () => {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFcChalonProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Test de récupération des produits FC CHALON (ID: 183)');
      
      // Récupérer les sous-catégories
      const categoriesFilles = await shopApi.getCategoriesFilles('183');
      console.log('📂 Catégories filles FC CHALON:', categoriesFilles);
      
      if (categoriesFilles && categoriesFilles.length > 0) {
        // Enregistrer les sous-catégories
        setSubcategories(categoriesFilles);
        
        // Récupérer les produits pour chaque sous-catégorie
        console.log('📡 Récupération des produits pour chaque sous-catégorie...');
        const allProductsPromises = categoriesFilles.map(async (subcat) => {
          console.log(`📡 Récupération des produits pour ${subcat.label}...`);
          const prods = await shopApi.getCategoryProductsViaDirect(subcat.id);
          console.log(`✅ ${prods.length} produits trouvés pour ${subcat.label}`);
          return {
            categoryId: subcat.id,
            categoryLabel: subcat.label,
            products: prods
          };
        });
        
        const results = await Promise.all(allProductsPromises);
        
        // Calculer le total des produits
        const allProducts = results.flatMap(r => r.products);
        setProducts(allProducts);
        console.log(`✅ Total: ${allProducts.length} produits dans toutes les sous-catégories`);
      } else {
        setError('Aucune catégorie fille trouvée');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du test:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-thunder uppercase mb-4">Test FC CHALON (ID: 183)</h3>
      
      <button 
        onClick={testFcChalonProducts}
        className="px-6 py-3 bg-nolt-orange text-white rounded-lg hover:bg-nolt-yellow hover:text-nolt-black transition-colors disabled:opacity-75 font-montserrat font-medium"
        disabled={loading}
      >
        {loading ? 'Chargement...' : 'Tester Produits FC CHALON'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <p className="font-montserrat">{error}</p>
        </div>
      )}
      
      {subcategories.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold font-montserrat mb-2">{subcategories.length} sous-catégories trouvées:</h4>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {subcategories.map(cat => (
              <div key={cat.id} className="bg-white p-3 rounded border">
                <div className="font-montserrat">{cat.label}</div>
                <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
                <span className="text-xs bg-gray-200 rounded px-2 py-1 mt-2 inline-block">ID: {cat.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {products.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold font-montserrat mb-2">{products.length} produits au total</h4>
          <table className="w-full mt-2 border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left text-sm">ID</th>
                <th className="p-2 text-left text-sm">Référence</th>
                <th className="p-2 text-left text-sm">Nom</th>
                <th className="p-2 text-left text-sm">Prix</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map(product => (
                <tr key={product.id} className="border-t">
                  <td className="p-2 text-sm">{product.id}</td>
                  <td className="p-2 text-sm">{product.ref}</td>
                  <td className="p-2 text-sm">{product.label}</td>
                  <td className="p-2 text-sm">{product.price} €</td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length > 5 && (
            <div className="text-center mt-2 text-sm text-gray-500">
              ... et {products.length - 5} autres produits
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FCChalonTest; 