/*
  # Création des tables pour les boutiques

  1. Nouvelles Tables
    - `shops`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, foreign key)
    
    - `products`
      - `id` (uuid, primary key)
      - `ref` (text)
      - `label` (text)
      - `description` (text)
      - `price` (numeric)
      - `stock` (integer)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `shop_products` (table de liaison)
      - `shop_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Table des boutiques
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table de liaison boutiques-produits
CREATE TABLE IF NOT EXISTS shop_products (
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (shop_id, product_id)
);

-- Activer RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;

-- Politiques pour les boutiques
CREATE POLICY "Les boutiques publiées sont visibles par tous" ON shops
  FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs peuvent gérer leurs boutiques" ON shops
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politiques pour les produits
CREATE POLICY "Les produits sont visibles par tous" ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Les admins peuvent gérer les produits" ON products
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM shops
    WHERE shops.user_id = auth.uid()
  ));

-- Politiques pour les liaisons boutiques-produits
CREATE POLICY "Les liaisons sont visibles par tous" ON shop_products
  FOR SELECT
  USING (true);

CREATE POLICY "Les admins peuvent gérer les liaisons" ON shop_products
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = shop_products.shop_id
    AND shops.user_id = auth.uid()
  ));

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();