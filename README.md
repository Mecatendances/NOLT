# Catalogue Dolibarr

Application de catalogue pour Dolibarr avec gestion des produits et des catégories.

## Fonctionnalités

- 📦 Gestion des produits
  - Vue liste et tableau
  - Détails des produits
  - Prix HT/TTC
  - Gestion des stocks

- 🌳 Gestion des catégories
  - Vue arborescente
  - Vue tableau
  - Recherche et filtrage
  - Navigation intuitive

## Installation

```bash
# Installation des dépendances
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrage en développement
npm run start:dev

# Démarrage en production
npm run build
npm run start:prod
```

## Routes disponibles

- `/` - Page d'accueil
- `/api/dolibarr/products-view` - Vue des produits
- `/api/dolibarr/products/table` - Tableau des produits
- `/api/dolibarr/categories/tree` - Arborescence des catégories
- `/api/dolibarr/categories/table` - Tableau des catégories

## Configuration

Configurez les variables d'environnement dans le fichier `.env` :

```env
DOLIBARR_API_URL=https://votre-url-dolibarr/api/index.php
DOLIBARR_API_KEY=votre-cle-api
PORT=4000
```

## Développement

Le projet utilise :
- NestJS pour le backend
- Express pour le serveur
- TypeScript pour le typage