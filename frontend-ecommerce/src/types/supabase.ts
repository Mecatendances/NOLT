// Type pour supabase - À enrichir selon le schéma réel de votre base de données
export type Database = {
  public: {
    Tables: {
      pages: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          status: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      shops: {
        Row: any;
        Insert: any;
        Update: any;
      };
      products: {
        Row: any;
        Insert: any;
        Update: any;
      };
      shop_products: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
  };
};