import { createClient } from '@supabase/supabase-js';

// Topplistan i Supabase nås med den publika nyckeln. Tabellen släpper bara igenom
// läsning; att spara går genom databasfunktionen submit_score, som kontrollerar
// värdena och behåller varje namns bästa resultat (supabase/migrations).
// Utan miljövariablerna är topplistan inte kopplad.
export function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
