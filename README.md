# NOLT E-commerce Platform

## 🚀 Aperçu du Projet

La plateforme e-commerce NOLT est une solution complète conçue pour s'interfacer avec Dolibarr ERP/CRM. Elle permet de gérer des boutiques en ligne, d'enrichir les fiches produits avec des informations spécifiques au web (nom d'affichage, images personnalisées), et de fournir une expérience utilisateur moderne tant pour les clients que pour les administrateurs.

L'objectif principal est d'offrir une flexibilité maximale pour la présentation des produits et la gestion des boutiques, tout en utilisant Dolibarr comme source de vérité pour les données produits de base et les stocks.

## 🛠️ Stack Technique

-   **Backend**:
    -   Framework: NestJS (Node.js, TypeScript)
    -   ORM: TypeORM
    -   Base de données: PostgreSQL
    -   Authentification: JWT
-   **Frontend**:
    -   Framework: React (Vite, TypeScript)
    -   Gestion d'état: React Query (TanStack Query)
    -   Routing: React Router
    -   Styling: Tailwind CSS
-   **Interface ERP/CRM**: Dolibarr (via API REST)

## ✨ Fonctionnalités Clés

### Gestion des Produits
-   **Source unique Dolibarr**: Les produits de base (référence, label, prix, stock) proviennent directement de Dolibarr.
-   **Enrichissement Web**: Possibilité d'ajouter/modifier des champs spécifiques pour l'affichage web :
    -   `webLabel`: Nom d'affichage personnalisé pour le site.
    -   `imageUrl`: Image produit personnalisée.
-   **Synchronisation**: Mécanismes pour synchroniser les données entre Dolibarr et la base de données locale (PostgreSQL).
-   **Affichage Conditionnel**: Le frontend affiche le `webLabel` s'il existe, sinon le `label` Dolibarr. L'image personnalisée (`imageUrl`) est prioritaire.

### Gestion des Images
-   **Upload via Admin**: Interface administrateur pour uploader des images produits personnalisées.
-   **Stockage Local**: Les images sont stockées sur le serveur backend (`/uploads/products`).
-   **Service Statique**: Les images sont servies directement par le backend (ex: `http://localhost:4000/uploads/products/image.jpg`).

### Administration
-   **Interface Dédiée**: Panneau d'administration pour la gestion des produits (webLabel, image), et potentiellement des boutiques, commandes, etc.
-   **Popup d'Édition**: Composant pour modifier rapidement les détails d'un produit.
-   **Rafraîchissement Automatique**: Utilisation de React Query pour invalider le cache et mettre à jour l'interface après modification.

## 📁 Structure du Projet

```
.
├── backend-ecommerce/  # Code source du backend NestJS
│   ├── src/
│   │   ├── auth/         # Gestion de l'authentification
│   │   ├── dolibarr/     # Connexion et synchronisation avec Dolibarr
│   │   ├── shops/        # (Anciennement) Gestion des boutiques et produits locaux, maintenant principalement pour l'upload
│   │   ├── users/        # Gestion des utilisateurs
│   │   └── ...           # Autres modules (commandes, campagnes, etc.)
│   ├── uploads/          # Dossier de stockage des images uploadées
│   └── ...
├── frontend-ecommerce/ # Code source du frontend React
│   ├── src/
│   │   ├── assets/       # Fichiers statiques (images, polices)
│   │   ├── components/   # Composants React réutilisables
│   │   ├── contexts/     # Contextes React (ex: AuthContext)
│   │   ├── layouts/      # Mises en page principales
│   │   ├── pages/        # Composants de page (vues)
│   │   ├── services/     # Logique d'appel API (api.ts)
│   │   ├── types/        # Définitions TypeScript
│   │   └── ...
│   └── ...
├── .github/            # Workflows GitHub Actions
├── .husky/             # Hooks Git (pour commitlint)
├── node_modules/       # Dépendances du projet racine (pour workspaces ou scripts globaux)
├── README.md           # Ce fichier
├── package.json        # Dépendances et scripts du projet racine
└── ...
```

## 셋업 Installation et Configuration

### Prérequis
-   Node.js (version recommandée: 18.x ou LTS)
-   npm (généralement inclus avec Node.js)
-   PostgreSQL (serveur de base de données local ou distant)
-   Accès à une instance Dolibarr avec API activée.

### 1. Cloner le Dépôt
```bash
git clone <URL_DU_DEPOT>
cd NOLT # ou le nom de votre dossier projet
```

### 2. Backend (`backend-ecommerce`)

a.  **Naviguer vers le dossier backend**:
    ```bash
    cd backend-ecommerce
    ```

b.  **Installer les dépendances**:
    ```bash
    npm install
    ```

c.  **Configurer les variables d'environnement**:
    Créez un fichier `.env` à la racine de `backend-ecommerce/` en vous basant sur `.env.example` (s'il existe) ou avec les variables suivantes :
    ```env
    # Configuration Dolibarr
    DOLIBARR_API_URL=https://votre-instance.dolibarr/api/index.php
    DOLIBARR_API_KEY=VOTRE_CLE_API_DOLIBARR

    # Configuration Base de Données PostgreSQL
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=votre_user_pg
    DB_PASSWORD=votre_mot_de_passe_pg
    DB_DATABASE=nolt_ecommerce_db # ou le nom de votre base

    # Configuration Serveur NestJS
    PORT=4000 # Port sur lequel le backend écoutera

    # Configuration JWT (Authentification)
    JWT_SECRET=VOTRE_SECRET_JWT_TRES_SECURISE
    # WP_JWT_AUTH_URL=https://votre-site-wp/wp-json/jwt-auth/v1/token/validate # Si validation WP fallback
    ```
    *Assurez-vous que la base de données (`DB_DATABASE`) existe sur votre serveur PostgreSQL.*

d.  **Lancer les migrations (si applicable avec TypeORM)**:
    Si des migrations sont configurées (généralement non nécessaire avec `synchronize: true` en développement).
    ```bash
    # npm run typeorm:migration:run # Exemple
    ```
    Avec `synchronize: true` dans la configuration TypeORM (souvent utilisé en dev), les tables sont créées/mises à jour automatiquement au démarrage.

### 3. Frontend (`frontend-ecommerce`)

a.  **Naviguer vers le dossier frontend**:
    ```bash
    cd ../frontend-ecommerce # si vous étiez dans backend-ecommerce
    # ou cd frontend-ecommerce depuis la racine
    ```

b.  **Installer les dépendances**:
    ```bash
    npm install
    ```

c.  **Configurer les variables d'environnement**:
    Créez un fichier `.env` à la racine de `frontend-ecommerce/` avec la variable suivante :
    ```env
    VITE_API_BASE_URL=http://localhost:4000/api # URL de votre backend NestJS
    ```
    *Note: Le `/api` à la fin est important si votre backend NestJS a un `setGlobalPrefix('api')`.*

## 🚀 Lancement du Projet

### 1. Démarrer le Backend
```bash
cd backend-ecommerce
npm run start:dev
```
Le serveur backend devrait démarrer sur `http://localhost:4000` (ou le port configuré).

### 2. Démarrer le Frontend
Dans un autre terminal :
```bash
cd frontend-ecommerce
npm run dev
```
L'application frontend devrait être accessible sur `http://localhost:5173` (ou un autre port si celui-ci est occupé).

## ⚙️ Scripts Utiles

### Backend
-   `npm run build`: Compiler le projet TypeScript.
-   `npm run start:prod`: Démarrer en mode production (après build).
-   `npm run lint`: Vérifier la qualité du code avec ESLint.
-   `npm run format`: Formater le code avec Prettier.

### Frontend
-   `npm run build`: Compiler et optimiser pour la production.
-   `npm run lint`: Vérifier la qualité du code.
-   `npm run preview`: Prévisualiser le build de production localement.

## 🌐 API Endpoints Principaux

L'API est préfixée par `/api`.

### Produits Dolibarr (enrichis)
-   `GET /dolibarr/products`: Liste des produits.
    -   Query params:
        -   `category` (string, optionnel): ID de la catégorie Dolibarr.
        -   `page` (number, optionnel, défaut: 0): Numéro de page.
        -   `includeStock` (boolean, optionnel, défaut: false): Inclure les données de stock.
-   `GET /dolibarr/products/:id`: Détails d'un produit (où `:id` est l'ID Dolibarr).
-   `PATCH /dolibarr/products/:id/web-label`: Mettre à jour le nom d'affichage web.
    -   Body: `{ "webLabel": "Nouveau Nom" }`
-   `POST /dolibarr/products/:id/image`: Uploader une image pour un produit.
    -   Body: `FormData` avec un champ `image` (fichier).

### Catégories Dolibarr
-   `GET /dolibarr/categories`: Liste des catégories.
-   `GET /dolibarr/categories/tree`: Arborescence des catégories.
-   `GET /dolibarr/noltapi/categoriesFilles/:id`: Récupérer les catégories filles (endpoint spécifique).

### Authentification
-   `POST /auth/login`: Connexion utilisateur.
    -   Body: `{ "email": "user@example.com", "password": "password123" }`
-   `GET /users/me`: Récupérer les informations de l'utilisateur connecté (protégé).

*(D'autres endpoints existent pour les boutiques, commandes, campagnes, etc. Consulter le code des contrôleurs pour une liste exhaustive.)*

## ✅ Bonnes Pratiques de Développement

-   **Consistance du Code**: Suivre les configurations ESLint et Prettier.
-   **Messages de Commit**: Utiliser `commitlint` (conventionnel) pour des messages de commit clairs.
-   **Tests**: Ajouter des tests unitaires et d'intégration (non détaillé ici, mais important).
-   **Sécurité**:
    -   Valider toutes les entrées utilisateur (class-validator dans NestJS).
    -   Protéger les routes sensibles avec des Guards (JwtAuthGuard).
    -   Stocker les secrets (clés API, `JWT_SECRET`) dans des variables d'environnement et ne jamais les commiter.

---

Pour toute question ou évolution, voir le code ou contacter l'équipe technique NOLT.