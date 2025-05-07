export interface Product {
  id: number;
  ref: string;
  label: string;
  price: number;
  stock: number;
  category?: string;
  description?: string;
  image_url?: string;
  subCategoryIds?: string[];
}

export interface Shop {
  id: number;
  name: string;
  description: string;
  products: Product[];
  created_at: string;
  updated_at: string;
}

// Structure de l'arborescence des catégories Dolibarr
export interface CategoryTree {
  id: string;
  label: string;
  children?: CategoryTree[];
}