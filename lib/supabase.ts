import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vxxjmgunxrvqknnwmdax.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eGptZ3VueHJ2cWtubndtZGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTY0NDIsImV4cCI6MjA4NDI3MjQ0Mn0.zY7MXjfb5HXjXLMYR2_xfDS594O_6VpXc8ErLTVdLwY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);