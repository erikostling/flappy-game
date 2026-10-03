import { supabase } from '@/lib/supabase';
import { board, cleanName, json, playerHash } from '@/lib/scores';

// POST { name } → { entries, mine }: tar ett namn som sparades innan namnen fick
// ägare, åt enheten i x-player-key. Spelet gör det med namnet det har sparat hos sig;
// ett namn som redan hör till någon annan förblir deras.

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const db = supabase();
  if (!db) return json({ error: 'not_configured' }, 503);

  const body = await request.json().catch(() => null);
  const name = cleanName(body?.name);
  const hash = playerHash(request);
  if (!hash || !name) return json({ error: 'invalid' }, 400);

  const { error } = await db.rpc('claim_name', { p_name: name, p_owner: hash });
  if (error) return json({ error: 'unavailable' }, 502);
  try {
    return json(await board(db, hash));
  } catch {
    return json({ error: 'unavailable' }, 502);
  }
}
