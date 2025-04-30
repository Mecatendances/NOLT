// Créons un nouveau fichier pour centraliser nos interfaces
export interface Product {
  id: number;
  ref: string;
  label: string;
  description?: string;
  price_ht?: number;
  price_ttc?: number;
  stock?: number;
  category?: string;
  image_url?: string[]; // Changé de string à string[] pour supporter plusieurs images
}

export interface DolibarrImage {
  name: string;
  fullname: string;
  type: string;
  size: number;
}

export interface DolibarrProduct {
  id: string;
  ref: string;
  label: string;
  description?: string;
  price: string;
  price_ttc: string;
  stock_reel?: string;
  price_ht?: number;
  price_ttc_number?: number;
  stock?: number;
  category?: string;
}

// Ajout de l'interface CategoryTree
export interface CategoryTree {
  id: string;
  label: string;
  description?: string;
  fk_parent?: string;
  children?: CategoryTree[];
  products?: DolibarrProduct[];
} 