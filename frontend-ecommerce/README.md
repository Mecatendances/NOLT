# Documentation NOLT 🏃‍♂️

[... contenu précédent jusqu'à la section Installation ...]

## Installation et démarrage

### Prérequis
- Node.js 18+ installé
- npm 9+ installé
- Un éditeur de code (VS Code recommandé)

### 1. Installation du projet

```bash
# Cloner le projet
git clone [url-du-repo]
cd [nom-du-projet]

# Installer les dépendances
npm install
```

### 2. Configuration de l'environnement

```bash
# Copier le fichier d'exemple des variables d'environnement
cp .env.example .env
```

Éditer le fichier `.env` avec vos valeurs :

```env
# Dolibarr
DOLIBARR_URL=http://votre-dolibarr.com/api
DOLIBARR_API_KEY=votre_api_key
DOLIBARR_WAREHOUSE_ID=1

# WordPress
WP_URL=http://votre-wordpress.com
JWT_SECRET=votre_secret_jwt

# AppViz Configurateur
APPVIZ_URL=http://api.appviz.com
APPVIZ_API_KEY=votre_api_key

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
```

### 3. Démarrage en développement

Ouvrir deux terminaux :

Terminal 1 (Frontend) :
```bash
npm run dev
```

Terminal 2 (Backend) :
```bash
npm run server
```

L'application sera accessible sur :
- Frontend : http://localhost:5173
- Backend : http://localhost:3000

### 4. Comptes de test

Pour tester l'application, utilisez les comptes suivants :

- **Admin NOLT** :
  - Email : admin@nolt.io
  - Mot de passe : password

- **Utilisateur** :
  - Email : user@example.com
  - Mot de passe : password

[... reste du contenu ...]