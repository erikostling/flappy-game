import { createClient } from '@supabase/supabase-js';

// Topplistorna i Supabase nås med den publika nyckeln. Tabellerna släpper bara igenom
// läsning; att spara går genom databasfunktionerna submit_score och
// submit_climbing_score, som kontrollerar värdena och behåller varje namns bästa
// resultat (supabase/migrations).
// Utan miljövariablerna är topplistan inte kopplad.
export function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
