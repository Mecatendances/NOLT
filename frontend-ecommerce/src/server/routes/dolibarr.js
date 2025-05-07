import express from 'express';
import axios from 'axios';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Schémas de validation
const ProductSchema = z.object({
  ref: z.string(),
  label: z.string(),
  price: z.number(),
  stock: z.number()
});

// Cache des produits
const PRODUCTS_CACHE_KEY = 'products';
const CACHE_DURATION = 3600; // 1 heure

// Middleware pour vérifier l'API key
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Clé API non valide' });
  }
  next();
};

/**
 * @route GET /api/dolibarr/products
 * @desc Récupérer tous les produits
 * @access Private
 */
router.get('/products', async (req, res, next) => {
  const { redis, logger } = req;
  
  try {
    // Vérifier le cache d'abord
    if (redis) {
      const cachedProducts = await redis.get(PRODUCTS_CACHE_KEY);
      if (cachedProducts) {
        return res.json(JSON.parse(cachedProducts));
      }
    }

    // Si pas en cache, récupérer depuis Dolibarr
    const response = await axios.get(`${process.env.DOLIBARR_URL}/products`, {
      headers: { 
        'DOLAPIKEY': process.env.DOLIBARR_API_KEY
      }
    });

    // Validation des données
    const products = response.data.map(product => ProductSchema.parse(product));

    // Mettre en cache si disponible
    if (redis) {
      await redis.setEx(PRODUCTS_CACHE_KEY, CACHE_DURATION, JSON.stringify(products));
    }

    res.json(products);
  } catch (error) {
    logger.error('Erreur produits Dolibarr:', error);
    next(error);
  }
});

/**
 * @route POST /api/dolibarr/sync-stock
 * @desc Synchroniser le stock d'un produit
 * @access Private
 */
router.post('/sync-stock', checkApiKey, async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { logger, redis } = req;

  try {
    await axios.put(`${process.env.DOLIBARR_URL}/products/${productId}/stock`, {
      quantity,
      warehouse_id: process.env.DOLIBARR_WAREHOUSE_ID
    }, {
      headers: { 'DOLAPIKEY': process.env.DOLIBARR_API_KEY }
    });

    // Invalider le cache des produits
    if (redis) {
      await redis.del(PRODUCTS_CACHE_KEY);
    }

    res.json({ message: "Stock mis à jour avec succès" });
  } catch (error) {
    logger.error('Erreur sync stock:', error);
    next(error);
  }
});

export const dolibarrRouter = router;