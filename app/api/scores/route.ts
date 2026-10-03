import { supabase } from '@/lib/supabase';
import { board, cleanName, json, playerHash } from '@/lib/scores';

// Topplistan.
//   GET  → { entries, mine }: de tio bästa, ett namn per rad, och vilka namn som hör
//        till enheten i x-player-key.
//   POST { name, score, figure } → { entries, mine }: sparar resultatet om det är
//        namnets bästa. Ett namn hör till den enhet som tog det först; för andra
//        svarar den 409.
// Svarar 503 när Supabase inte är kopplad och 502 när databasen inte svarar.

export const dynamic = 'force-dynamic';

const MAX_SCORE = 9999;

export async function GET(request: Request) {
  const db = supabase();
  if (!db) return json({ error: 'not_configured' }, 503);
  try {
    return json(await board(db, playerHash(request)));
  } catch {
    return json({ error: 'unavailable' }, 502);
  }
}

export async function POST(request: Request) {
  const db = supabase();
  if (!db) return json({ error: 'not_configured' }, 503);

  const body = await request.json().catch(() => null);
  const name = cleanName(body?.name);
  const score = Number(body?.score);
  const figure = typeof body?.figure === 'string' && /^[a-z]{1,20}$/.test(body.figure) ? body.figure : 'apa';
  const hash = playerHash(request);
  if (!hash || !name || !Number.isInteger(score) || score < 1 || score > MAX_SCORE) {
    return json({ error: 'invalid' }, 400);
  }

  // submit_score behåller namnets bästa resultat; "Erik" och "erik" är samma namn.
  const { data, error } = await db.rpc('submit_score', { p_name: name, p_score: score, p_figure: figure, p_owner: hash });
  if (error) return json({ error: 'unavailable' }, 502);
  if (data === 'taken') return json({ error: 'name_taken' }, 409);
  try {
    return json(await board(db, hash));
  } catch {
    return json({ error: 'unavailable' }, 502);
  }
}
