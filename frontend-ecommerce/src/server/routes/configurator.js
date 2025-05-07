import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * @route GET /api/configurator/templates
 * @desc Récupérer les templates de configuration 3D
 * @access Private
 */
router.get('/templates', async (req, res, next) => {
  const { logger } = req;

  try {
    const response = await axios.get(`${process.env.APPVIZ_URL}/templates`, {
      headers: { 
        'Authorization': `Bearer ${process.env.APPVIZ_API_KEY}`
      }
    });

    res.json(response.data);
  } catch (error) {
    logger.error('Erreur templates configurateur:', error);
    next(error);
  }
});

/**
 * @route POST /api/configurator/save-config
 * @desc Sauvegarder une configuration 3D
 * @access Private
 */
router.post('/save-config', async (req, res, next) => {
  const { config, userId } = req.body;
  const { logger } = req;

  try {
    const response = await axios.post(`${process.env.APPVIZ_URL}/configurations`, {
      userId,
      config
    }, {
      headers: { 
        'Authorization': `Bearer ${process.env.APPVIZ_API_KEY}`
      }
    });

    res.json(response.data);
  } catch (error) {
    logger.error('Erreur sauvegarde config:', error);
    next(error);
  }
});

export const configuratorRouter = router;