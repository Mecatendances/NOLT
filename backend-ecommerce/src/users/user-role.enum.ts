// Rôles globaux (système)
export enum GlobalRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  LICENSEE = 'LICENSEE',
  CLIENT = 'CLIENT'
}

// Rôles spécifiques aux boutiques
export enum ShopRole {
  SHOP_ADMIN = 'SHOP_ADMIN',        // Admin de la boutique
  SHOP_LICENSEE = 'SHOP_LICENSEE',  // Licencié de la boutique
  SHOP_COACH = 'SHOP_COACH',        // Coach de la boutique
  SHOP_CLIENT = 'SHOP_CLIENT'       // Client de la boutique
} 