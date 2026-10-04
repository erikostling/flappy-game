import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Det topplistornas API-vägar delar på: Flappy Games i /api/scores och Climbing
// Games i /api/climbing/scores. Varje lista har sin tabell och sin databasfunktion
// som sparar i den; ett namn hör till samma enhet i båda.

export const TOP = 10;
const MAX_SCORE = 9999;

export type Board = { table: 'scores' | 'climbing_scores'; submit: 'submit_score' | 'submit_climbing_score' };
export const FLAPPY: Board = { table: 'scores', submit: 'submit_score' };
export const CLIMBING: Board = { table: 'climbing_scores', submit: 'submit_climbing_score' };

export type Db = NonNullable<ReturnType<typeof supabase>>;
type Row = { name: string; score: number; figure: string; created_at: string };

export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'cache-control': 'no-store' } });

// Varje enhet skickar en egen slumpad nyckel i x-player-key. Databasen sparar bara en
// hash av den, som ägare till de namn enheten har tagit.
export function playerHash(request: Request) {
  const key = request.headers.get('x-player-key') ?? '';
  return /^[\w-]{16,100}$/.test(key) ? createHash('sha256').update(key).digest('hex') : null;
}

// De tio bästa, och vilka namn (i gemener) som hör till den här enheten.
export async function board(db: Db, hash: string | null, list: Board = FLAPPY) {
  const top = await db
    .from(list.table)
    .select('name, score, figure, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(TOP);
  if (top.error) throw top.error;
  const entries = (top.data as Row[]).map(r => ({ name: r.name, score: r.score, figure: r.figure, at: r.created_at }));
  if (!hash) return { entries, mine: [] };
  const own = await db.from(list.table).select('name_key').eq('owner', hash);
  if (own.error) throw own.error;
  return { entries, mine: (own.data as { name_key: string }[]).map(r => r.name_key) };
}

export const cleanName = (value: unknown) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, 12) : '';

// GET → { entries, mine }: de tio bästa, ett namn per rad, och vilka namn som hör
// till enheten i x-player-key.
export async function getBoard(request: Request, list: Board) {
  const db = supabase();
  if (!db) return json({ error: 'not_configured' }, 503);
  try {
    return json(await board(db, playerHash(request), list));
  } catch {
    return json({ error: 'unavailable' }, 502);
  }
}

// POST { name, score, figure } → { entries, mine }: sparar resultatet om det är
// namnets bästa. Ett namn som en annan enhet har tagit, i något av spelen, ger 409.
export async function postScore(request: Request, list: Board) {
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

  // funktionen behåller namnets bästa resultat; "Erik" och "erik" är samma namn
  const { data, error } = await db.rpc(list.submit, { p_name: name, p_score: score, p_figure: figure, p_owner: hash });
  if (error) return json({ error: 'unavailable' }, 502);
  if (data === 'taken') return json({ error: 'name_taken' }, 409);
  try {
    return json(await board(db, hash, list));
  } catch {
    return json({ error: 'unavailable' }, 502);
  }
}
