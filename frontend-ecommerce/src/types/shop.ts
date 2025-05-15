export interface Product {
  id: number;
  ref: string;
  label: string;
  webLabel?: string;
  imageUrl?: string;
  price: number;
  stock: number;
  category?: string;
  description?: string;
  subCategoryIds?: string[];
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  products: Product[];
  adminId: string;
  orders?: any[];
  created_at: string;
  updated_at: string;
}

// Structure de l'arborescence des catégories Dolibarr
export interface CategoryTree {
  id: string;
  label: string;
  children?: CategoryTree[];
}