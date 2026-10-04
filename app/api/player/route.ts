import { supabase } from '@/lib/supabase';
import { claimPlayer, cleanName, json, playerHash } from '@/lib/scores';

// Spelarens namn, som väljs första gången och aldrig kan bytas. Det gäller i båda
// spelen, och topplistorna sparar bara under det.
//   POST { name } → { name }: enhetens namn. Har enheten inget än tar den `name`;
//        med ett tomt `name` svarar den bara, med { name: null } om det inte finns.
//        409 när namnet hör till en annan enhet.
// Svarar 503 när Supabase inte är kopplad och 502 när databasen inte svarar.

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const db = supabase();
  if (!db) return json({ error: 'not_configured' }, 503);

  const body = await request.json().catch(() => null);
  const hash = playerHash(request);
  if (!hash) return json({ error: 'invalid' }, 400);

  try {
    const wanted = cleanName(body?.name);
    // ett namn som sparades innan namnen fick ägare blir den här enhetens, om det inte
    // hör till någon annan
    if (wanted) await db.rpc('claim_name', { p_name: wanted, p_owner: hash });
    const name = await claimPlayer(db, hash, wanted);
    if (name === 'taken') return json({ error: 'name_taken' }, 409);
    return json({ name });
  } catch {
    return json({ error: 'unavailable' }, 502);
  }
}
