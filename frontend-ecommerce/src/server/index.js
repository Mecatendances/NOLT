import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createMockProducts, createDefaultShops } from './mockData.js';

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Produits et boutiques de démo
const mockProducts = createMockProducts();
const mockShops = createDefaultShops();

// Routes pour les produits
app.get('/api/products', (req, res) => {
  res.json(mockProducts);
});

// Routes pour les boutiques
app.get('/api/shops', (req, res) => {
  res.json(mockShops);
});

app.get('/api/shops/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const shop = mockShops.find(s => s.id === id);
  
  if (!shop) {
    return res.status(404).json({ message: "Boutique non trouvée" });
  }
  
  res.json(shop);
});

// Route de test
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);

  // Erreur par défaut
  res.status(500).json({ 
    message: "Erreur serveur interne" 
  });
});

// Fonction pour trouver un port disponible
const startServer = (initialPort = 3000) => {
  const tryPort = (port) => {
    try {
      const server = app.listen(port, () => {
        console.log(`🏃‍♂️ Serveur démarré sur le port ${port}`);
      });

      server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
          console.log(`Port ${port} occupé, essai avec le port ${port + 1}...`);
          tryPort(port + 1);
        } else {
          console.error('Erreur du serveur:', e);
        }
      });
    } catch (error) {
      console.error('Erreur lors du démarrage du serveur:', error);
      tryPort(port + 1);
    }
  };

  const PORT = process.env.PORT || initialPort;
  tryPort(parseInt(PORT));
};

// Démarrer le serveur
startServer();