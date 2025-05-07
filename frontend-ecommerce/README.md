# Frontend Ecommerce FC Chalon

## Prérequis
- Node.js (v18 ou supérieur recommandé)
- npm ou yarn

## Installation

```bash
cd frontend-ecommerce
npm install
```

## Lancement du projet

```bash
npm run dev
```

Le frontend sera accessible par défaut sur [http://localhost:5173](http://localhost:5173)

## Fonctionnalités principales
- Affichage dynamique des sous-catégories de la boutique FC Chalon dès l'ouverture de la page `/public/shops`.
- Récupération des sous-catégories via l'API `/api/dolibarr/noltapi/categoriesFilles/183`.
- Affichage des produits par sous-catégorie (filtrage dynamique).
- Plus aucun fallback de données mockées ni de composant de debug.

## Dépannage
- Si les sous-catégories ne s'affichent pas, vérifiez que le backend est bien lancé et que l'API répond.
- En cas de problème de commit avec Husky/commitlint, utilisez l'option `--no-verify` pour bypasser temporairement les hooks.

## Déploiement
- Toutes les modifications sont à pousser sur la branche `feat/fcchalon-clean`.

---

Pour toute question, contactez l'équipe technique NOLT.