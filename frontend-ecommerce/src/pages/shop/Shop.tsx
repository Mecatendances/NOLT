import { shopApi } from '../services/api';

const testFcChalonProducts = async () => {
  console.log('🔍 Test de récupération des produits FC CHALON');
  try {
    // Test avec l'ancienne méthode
    const products1 = await shopApi.getProductsByCategory('183');
    console.log('📊 Produits FC CHALON (méthode 1):', products1);
    
    // Test avec la nouvelle méthode directe
    const products2 = await shopApi.getCategoryProductsViaDirect('183');
    console.log('📊 Produits FC CHALON (méthode 2):', products2);
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
};

<div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
  <h3>Tests de développement</h3>
  <button 
    onClick={testFcChalonProducts}
    style={{
      padding: '10px 15px',
      background: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    Tester Produits FC CHALON
  </button>
</div> 