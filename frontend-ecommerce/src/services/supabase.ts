import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// On récupère les variables depuis les env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'example-key';

// Pour le développement, on va juste créer le client, même si les credentials sont invalides
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);