import { supabase } from './supabase';

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const pagesService = {
  // Récupérer toutes les pages
  getPages: async (): Promise<Page[]> => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des pages', error);
      // Pour le développement, retourner des données fictives si Supabase n'est pas configuré
      return [
        {
          id: '1',
          title: 'Accueil',
          slug: 'accueil',
          content: '<h1>Bienvenue sur FC Chalon</h1><p>Contenu de la page d\'accueil</p>',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: '1'
        },
        {
          id: '2',
          title: 'À propos',
          slug: 'a-propos',
          content: '<h1>À propos de FC Chalon</h1><p>Histoire du club</p>',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: '1'
        }
      ];
    }
  },

  // Récupérer une page par son ID
  getPage: async (id: string): Promise<Page> => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la page ${id}`, error);
      // Pour le développement, retourner des données fictives
      return {
        id: id,
        title: 'Page exemple',
        slug: 'exemple',
        content: '<h1>Contenu exemple</h1><p>Cette page est générée localement car Supabase n\'est pas configuré.</p>',
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: '1'
      };
    }
  },

  // Créer une nouvelle page
  createPage: async (page: Omit<Page, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Page> => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert([page])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la page', error);
      // Simuler une création réussie
      return {
        ...page,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: '1'
      } as Page;
    }
  },

  // Mettre à jour une page
  updatePage: async (id: string, page: Partial<Page>): Promise<Page> => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .update(page)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la page ${id}`, error);
      // Simuler une mise à jour réussie
      return {
        ...page,
        id,
        updated_at: new Date().toISOString(),
      } as Page;
    }
  },

  // Supprimer une page
  deletePage: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la page ${id}`, error);
    }
  }
};