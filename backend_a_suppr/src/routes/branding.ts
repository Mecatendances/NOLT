import { Router } from 'express';
import { BrandingController } from '../controllers/BrandingController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';

const router = Router();
const controller = new BrandingController();
const upload = multer({ dest: 'uploads/temp/' });

// Routes protégées par authentification
router.use(authenticate);

// Récupérer les paramètres de branding
router.get('/', controller.getSettings.bind(controller));

// Mettre à jour les paramètres de branding
router.put('/', controller.updateSettings.bind(controller));

// Upload d'image (logo, favicon, image de couverture)
router.post('/upload/:type', upload.single('file'), controller.uploadImage.bind(controller));

export default router; 