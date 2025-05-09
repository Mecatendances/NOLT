import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DolibarrSyncService } from './dolibarr-sync.service';
import { SyncResult } from './dolibarr-sync.service';

@Injectable()
export class DolibarrSyncTask {
  private readonly logger = new Logger(DolibarrSyncTask.name);

  constructor(private readonly syncService: DolibarrSyncService) {}

  // Exécution chaque jour à 03h00 (heure serveur)
  @Cron('0 0 3 * * *')
  async handleDailySync() {
    const fcChalonId = '183';
    this.logger.log(`⏰ Sync quotidienne Dolibarr → BD (catégorie ${fcChalonId})`);
    try {
      const result = await this.syncService.sync(fcChalonId);
      
      // Vérifier le type du résultat
      if ('categories' in result && 'products' in result) {
        this.logger.log(`✅ Synchronisation terminée : ${result.categories} catégories, ${result.products} produits`);
      } else {
        // Si c'est un message d'erreur
        this.logger.log(`ℹ️ ${result.message || 'Synchronisation effectuée'}`);
      }
    } catch (error) {
      this.logger.error('❌ Erreur de synchronisation Dolibarr', error);
    }
  }
} 