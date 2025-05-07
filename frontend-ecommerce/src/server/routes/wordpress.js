import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * @route POST /api/wordpress/auth
 * @desc Authentification via WordPress
 * @access Public
 */
router.post('/auth', async (req, res, next) => {
  const { username, password } = req.body;
  const { logger } = req;

  try {
    // Vérifier les credentials sur WordPress
    const response = await axios.post(`${process.env.WP_URL}/wp-json/jwt-auth/v1/token`, {
      username,
      password
    });

    // Si c'est bon, créer notre propre token
    const token = jwt.sign(
      { userId: response.data.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        id: response.data.user_id,
        name: response.data.user_display_name,
        email: response.data.user_email
      }
    });
  } catch (error) {
    logger.error('Erreur auth WordPress:', error);
    res.status(401).json({ message: "Identifiants invalides" });
  }
});

/**
 * @route GET /api/wordpress/pages
 * @desc Récupérer les pages WordPress
 * @access Private
 */
router.get('/pages', async (req, res, next) => {
  const { logger } = req;

  try {
    const response = await axios.get(`${process.env.WP_URL}/wp-json/wp/v2/pages`, {
      params: {
        per_page: 100
      }
    });

    res.json(response.data);
  } catch (error) {
    logger.error('Erreur récupération pages WordPress:', error);
    next(error);
  }
});

export const wordpressRouter = router;