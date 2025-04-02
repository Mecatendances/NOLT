import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log("📡 Envoi requête vers API...");
        const response = await fetch("http://localhost:4000/dolibarr/products");
        console.log("✅ Réponse reçue:", response);

        if (!response.ok) throw new Error("Problème avec l'API");

        const data = await response.json();
        console.log("📦 Produits récupérés:", data);
        setProducts(data);
      } catch (error) {
        console.error("❌ Erreur chargement produits:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Nos Produits ⚽</h1>
      {loading ? <p>Chargement en cours...</p> : null}

      <ul>
        {products.length > 0 ? (
          products.map((product) => (
            <li key={product.id}>
              <h2>{product.label}</h2>
              <p>{product.description}</p>
              <p>Prix: {product.price} €</p>
            </li>
          ))
        ) : (
          <p>Aucun produit trouvé.</p>
        )}
      </ul>
    </div>
  );
}
