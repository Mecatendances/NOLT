#!/bin/bash

# === Étape 1 : Initialiser le projet Next.js ===
echo "🚀 Initialisation du projet Next.js..."
npx create-next-app@latest frontend-ecommerce --use-npm --typescript --eslint --app --tailwind

# Aller dans le dossier du projet
cd frontend-ecommerce || exit

# === Étape 2 : Installer Chakra UI, Axios, React Context, et Stripe (pour le paiement) ===
echo "📦 Installation des dépendances..."
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion axios react-icons react-toastify

# === Étape 3 : Créer l'architecture des dossiers ===
echo "📂 Création des dossiers..."
mkdir -p src/components src/pages src/styles src/utils src/hooks src/contexts public/assets

# === Étape 4 : Génération des fichiers avec 'cat' ===

echo "📄 Génération des fichiers..."

# _app.tsx (wrapper global avec Chakra + Contexte panier)
cat <<EOL > src/pages/_app.tsx
import { ChakraProvider } from "@chakra-ui/react";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/contexts/CartContext";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <CartProvider>
        <Navbar />
        <Component {...pageProps} />
      </CartProvider>
    </ChakraProvider>
  );
}

export default MyApp;
EOL

# API de connexion au backend
cat <<EOL > src/utils/api.ts
import axios from "axios";

const API_URL = "http://localhost:4000/dolibarr";

export const getProducts = async () => {
  const response = await axios.get(\`\${API_URL}/products\`);
  return response.data;
};

export const getProductById = async (id: number) => {
  const response = await axios.get(\`\${API_URL}/products/\${id}\`);
  return response.data;
};
EOL

# Navbar.tsx
cat <<EOL > src/components/Navbar.tsx
import { Box, Flex, Link } from "@chakra-ui/react";

export default function Navbar() {
  return (
    <Box bg="blue.500" p={4} color="white">
      <Flex justify="space-around">
        <Link href="/">🏠 Accueil</Link>
        <Link href="/products">⚽ Produits</Link>
        <Link href="/cart">🛒 Panier</Link>
      </Flex>
    </Box>
  );
}
EOL

# ProductCard.tsx
cat <<EOL > src/components/ProductCard.tsx
import { Box, Image, Text, Button } from "@chakra-ui/react";
import { useCart } from "@/contexts/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
      <Image src={product.image || "/assets/default.jpg"} alt={product.name} />
      <Text mt={2} fontSize="xl" fontWeight="bold">{product.name}</Text>
      <Text color="gray.500">{product.price} €</Text>
      <Button colorScheme="blue" mt={2} onClick={() => addToCart(product)}>Ajouter au panier</Button>
    </Box>
  );
}
EOL

# CartContext.tsx
cat <<EOL > src/contexts/CartContext.tsx
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
EOL

# Page d'accueil
cat <<EOL > src/pages/index.tsx
import { Box, Heading, Text } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box textAlign="center" mt={10}>
      <Heading>🏆 Bienvenue sur notre boutique de maillots !</Heading>
      <Text fontSize="xl" mt={4}>Découvrez nos produits avec un humour potache !</Text>
    </Box>
  );
}
EOL

# Page produits
cat <<EOL > src/pages/products.tsx
import { useEffect, useState } from "react";
import { getProducts } from "@/utils/api";
import ProductCard from "@/components/ProductCard";
import { Grid, Container } from "@chakra-ui/react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
  }, []);

  return (
    <Container maxW="container.xl">
      <h1>Nos Produits</h1>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Grid>
    </Container>
  );
}
EOL

# Page panier
cat <<EOL > src/pages/cart.tsx
import { useCart } from "@/contexts/CartContext";
import { Box, Heading, Button } from "@chakra-ui/react";

export default function Cart() {
  const { cart, removeFromCart } = useCart();

  return (
    <Box textAlign="center" mt={10}>
      <Heading>🛒 Votre panier</Heading>
      {cart.length === 0 ? (
        <p>Votre panier est vide</p>
      ) : (
        cart.map((item) => (
          <Box key={item.id}>
            <p>{item.name} - {item.price} €</p>
            <Button onClick={() => removeFromCart(item.id)}>❌ Supprimer</Button>
          </Box>
        ))
      )}
    </Box>
  );
}
EOL

# === Étape 5 : Lancer le serveur ===
echo "🚀 Lancement du serveur..."
npm run dev
