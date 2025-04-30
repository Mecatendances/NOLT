# API Dolibarr

Backend API pour l'interface avec Dolibarr.

## Endpoints

### Produits
- `GET /api/dolibarr/products` - Liste des produits
  - Query params:
    - `category`: ID de la catégorie (optionnel)
    - `page`: Numéro de page (défaut: 0)
    - `includeStock`: Inclure les données de stock (défaut: false)
- `GET /api/dolibarr/products/:id` - Détails d'un produit

### Catégories
- `GET /api/dolibarr/categories` - Liste des catégories
- `GET /api/dolibarr/categories/tree` - Arborescence des catégories
- `GET /api/dolibarr/categories/:id/products` - Produits d'une catégorie

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` :
```env
DOLIBARR_API_URL=https://votre-url-dolibarr/api/index.php
DOLIBARR_API_KEY=votre-cle-api
PORT=4000
```

## Développement

```bash
npm run start:dev
```

Une fois ces modifications faites, nous pourrons :
1. Tester que l'API fonctionne correctement
2. Commiter ces changements
3. Intégrer votre frontend

Voulez-vous que je procède à ces modifications ?