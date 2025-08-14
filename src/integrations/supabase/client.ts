import { createClient } from '@supabase/supabase-js';

// Read from environment variables (VITE_ prefix works with Vite/React projects)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
