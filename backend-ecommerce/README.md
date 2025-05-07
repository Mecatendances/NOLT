# Backend Ecommerce FC Chalon (API Dolibarr)

API NestJS pour l'interface e-commerce avec Dolibarr.

## Prérequis
- Node.js (v18 ou supérieur recommandé)
- npm

## Installation

```bash
cd backend-ecommerce
npm install
```

## Configuration

Créez un fichier `.env` à la racine du dossier `backend-ecommerce` :
```env
DOLIBARR_API_URL=https://votre-url-dolibarr/api/index.php
DOLIBARR_API_KEY=votre-cle-api
PORT=4000
```

## Lancement du backend

```bash
npm run start:dev
```
Le backend sera accessible sur [http://localhost:4000](http://localhost:4000)

## Endpoints principaux

### Général
- `GET /api` : Page d'accueil de l'API (HTML)
- `GET /api/health` : Vérification de l'état de santé de l'API

### Dolibarr
#### Produits
- `GET /api/dolibarr/products` : Liste tous les produits
  - Query params :
    - `category` (optionnel) : ID de la catégorie à filtrer
    - `page` (optionnel, défaut 0)
    - `includeStock` (optionnel, défaut false)
- `GET /api/dolibarr/products/:id` : Détail d'un produit par son ID

#### Catégories
- `GET /api/dolibarr/categories` : Liste toutes les catégories
- `GET /api/dolibarr/categories/tree` : Arborescence complète des catégories
- `GET /api/dolibarr/noltapi/categoriesFilles/:id` : Sous-catégories de la catégorie `:id` (ex : `/api/dolibarr/noltapi/categoriesFilles/183` pour FC Chalon)

### Authentification
- `GET /api/api/protected-route` : Route protégée par JWT (nécessite un token)

### Administration
- `GET /api/admin` : Données sécurisées pour admin (protégé par un guard de rôle)

## Scripts utiles

- `npm run start:dev` : Démarrage en mode développement (hot reload)
- `npm run start` : Démarrage en mode production
- `npm run build` : Build du projet
- `npm run test` : Lancer les tests unitaires
- `npm run lint` : Linter le code

## Structure du projet
- `src/dolibarr/` : Contrôleur, service et interfaces pour l'intégration Dolibarr
- `src/auth/` : Authentification JWT, guards, etc.
- `src/admin/` : Routes d'administration protégées
- `src/app.controller.ts` : Contrôleur principal (accueil, health)

## Notes
- Toutes les routes sont préfixées par `/api`.
- L'API communique avec un Dolibarr distant via axios.
- Les sous-catégories pour FC Chalon sont accessibles via `/api/dolibarr/noltapi/categoriesFilles/183`.

---

Pour toute question, contactez l'équipe technique NOLT.
