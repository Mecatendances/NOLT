import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { BrandingSettings } from '../entities/BrandingSettings';
import { Shop } from '../entities/Shop';
import { uploadFile } from '../utils/fileUpload';
import { isSuperAdmin } from '../middleware/auth';

export class BrandingController {
  private brandingRepository = getRepository(BrandingSettings);
  private shopRepository = getRepository(Shop);

  // Récupérer les paramètres de branding (global ou par boutique)
  async getSettings(req: Request, res: Response) {
    try {
      const { shopId } = req.query;
      let settings: BrandingSettings | undefined;

      if (shopId) {
        // Vérifier si la boutique existe
        const shop = await this.shopRepository.findOne(shopId as string);
        if (!shop) {
          return res.status(404).json({ message: 'Boutique non trouvée' });
        }

        // Récupérer les paramètres de la boutique
        settings = await this.brandingRepository.findOne({ where: { shopId: shopId as string } });
      } else {
        // Récupérer les paramètres globaux (shopId = null)
        settings = await this.brandingRepository.findOne({ where: { shopId: null } });
      }

      if (!settings) {
        // Créer des paramètres par défaut si aucun n'existe
        settings = this.brandingRepository.create({
          name: shopId ? 'Ma Boutique' : 'NOLT',
          description: '',
          footer: '',
          email: '',
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e',
          socialLinks: {},
          shopId: shopId as string || null,
        });
        await this.brandingRepository.save(settings);
      }

      return res.json(settings);
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de branding:', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // Mettre à jour les paramètres de branding
  async updateSettings(req: Request, res: Response) {
    try {
      const { shopId } = req.query;
      const updateData = req.body;

      // Vérifier les permissions
      if (shopId) {
        const shop = await this.shopRepository.findOne(shopId as string);
        if (!shop) {
          return res.status(404).json({ message: 'Boutique non trouvée' });
        }
        // Vérifier si l'utilisateur est admin de la boutique
        if (!req.user?.shopRoles?.some(role => role.shopId === shopId && role.role === 'admin')) {
          return res.status(403).json({ message: 'Accès non autorisé' });
        }
      } else {
        // Vérifier si l'utilisateur est superadmin pour les paramètres globaux
        if (!isSuperAdmin(req.user)) {
          return res.status(403).json({ message: 'Accès non autorisé' });
        }
      }

      let settings = await this.brandingRepository.findOne({
        where: { shopId: shopId as string || null }
      });

      if (!settings) {
        settings = this.brandingRepository.create({
          ...updateData,
          shopId: shopId as string || null,
        });
      } else {
        this.brandingRepository.merge(settings, updateData);
      }

      await this.brandingRepository.save(settings);
      return res.json(settings);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres de branding:', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // Upload d'image (logo, favicon, image de couverture)
  async uploadImage(req: Request, res: Response) {
    try {
      const { shopId } = req.query;
      const { type } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'Aucun fichier fourni' });
      }

      // Vérifier les permissions
      if (shopId) {
        const shop = await this.shopRepository.findOne(shopId as string);
        if (!shop) {
          return res.status(404).json({ message: 'Boutique non trouvée' });
        }
        // Vérifier si l'utilisateur est admin de la boutique
        if (!req.user?.shopRoles?.some(role => role.shopId === shopId && role.role === 'admin')) {
          return res.status(403).json({ message: 'Accès non autorisé' });
        }
      } else {
        // Vérifier si l'utilisateur est superadmin pour les paramètres globaux
        if (!isSuperAdmin(req.user)) {
          return res.status(403).json({ message: 'Accès non autorisé' });
        }
      }

      // Upload du fichier
      const uploadPath = `uploads/${shopId || 'global'}`;
      const result = await uploadFile(file, uploadPath);

      // Mettre à jour les paramètres de branding
      let settings = await this.brandingRepository.findOne({
        where: { shopId: shopId as string || null }
      });

      if (!settings) {
        settings = this.brandingRepository.create({
          shopId: shopId as string || null,
        });
      }

      settings[type] = result.url;
      await this.brandingRepository.save(settings);

      return res.json({ url: result.url });
    } catch (error) {
      console.error('Erreur lors de l\'upload d\'image:', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }
} 