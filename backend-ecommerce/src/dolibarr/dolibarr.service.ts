import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DolibarrService {
  private readonly apiUrl = process.env.DOLIBARR_API_URL;
  private readonly apiKey = process.env.DOLIBARR_API_KEY;

  async getProducts(categoryId?: number, page = 0, includeStock = false) {
    try {
      const url = `${this.apiUrl}/products`;
      const params: any = {
        DOLAPIKEY: this.apiKey,
        limit: 999999, // Force une limite très élevée
        page: 0, // Force la première page
        includestockdata: includeStock ? 1 : 0,
      };

      if (categoryId) {
        params.category = categoryId;
      }

      console.log(`📡 Requête vers Dolibarr: ${url} avec paramètres:`, params);

      const response = await axios.get(url, { params });

      // ✅ Cast de la réponse
      if (!Array.isArray(response.data)) {
        console.error(`⚠️ Réponse inattendue:`, response.data);
        throw new Error('Réponse invalide reçue de Dolibarr');
      }

      console.log(`✅ Produits récupérés (${response.data.length} résultats)`);
      console.log(`🔍 Premier produit:`, response.data[0]);
      console.log(`🔍 Dernier produit:`, response.data[response.data.length - 1]);

      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération produits Dolibarr:', err.response?.data || err.message);

      // 🔥 Ajoute plus de détails sur l'erreur
      throw new Error(
        `Impossible de récupérer les produits : ${
          err.response?.data?.message || err.message
        }`
      );
    }
  }

  async getCategories() {
    try {
      const url = `${this.apiUrl}/categories`;
      const params = { 
        DOLAPIKEY: this.apiKey, 
        type: 0,
        limit: 999999 // Force une limite très élevée
      };

      console.log(`📡 Requête vers Dolibarr: ${url} avec paramètres:`, params);

      const response = await axios.get(url, { params });

      if (!Array.isArray(response.data)) {
        console.error(`⚠️ Réponse inattendue:`, response.data);
        throw new Error('Réponse invalide reçue de Dolibarr');
      }

      console.log(`✅ Catégories récupérées (${response.data.length} résultats)`);
      console.log(`🔍 Première catégorie:`, response.data[0]);
      console.log(`🔍 Dernière catégorie:`, response.data[response.data.length - 1]);

      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération catégories Dolibarr:', err.response?.data || err.message);
      throw new Error(
        `Impossible de récupérer les catégories : ${
          err.response?.data?.message || err.message
        }`
      );
    }
  }

  async getThirdParties() {
    try {
      const url = `${this.apiUrl}/thirdparties`;
      const params = { 
        DOLAPIKEY: this.apiKey,
        limit: 999999
      };

      console.log(`📡 Requête vers Dolibarr: ${url} avec paramètres:`, params);

      const response = await axios.get(url, { params });

      if (!Array.isArray(response.data)) {
        console.error(`⚠️ Réponse inattendue:`, response.data);
        throw new Error('Réponse invalide reçue de Dolibarr');
      }

      console.log(`✅ Tiers récupérés (${response.data.length} résultats)`);
      console.log(`🔍 Premier tiers:`, response.data[0]);
      console.log(`🔍 Dernier tiers:`, response.data[response.data.length - 1]);

      return response.data;
    } catch (err) {
      console.error('❌ Erreur récupération tiers Dolibarr:', err.response?.data || err.message);
      throw new Error(
        `Impossible de récupérer les tiers : ${
          err.response?.data?.message || err.message
        }`
      );
    }
  }
}
