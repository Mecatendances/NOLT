/*
  # Création des tables pour le back-office

  1. Nouvelles Tables
    - `pages`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `content` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on `pages` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture des pages publiées (tout le monde)
CREATE POLICY "Pages publiées visibles par tous" ON pages
  FOR SELECT
  USING (status = 'published');

-- Politique pour la lecture de toutes les pages (utilisateurs authentifiés)
CREATE POLICY "Admins peuvent lire toutes les pages" ON pages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique pour la création/modification/suppression (admins seulement)
CREATE POLICY "Admins peuvent gérer leurs pages" ON pages
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();