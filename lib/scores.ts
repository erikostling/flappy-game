import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Det topplistornas API-vägar delar på: Flappy Games i /api/scores, Climbing Games i
// /api/climbing/scores och Car Games i /api/car/scores. Varje lista har sin tabell och
// sin databasfunktion som sparar i den; ett namn hör till samma enhet i alla. I Car
// Game är poängen en tid, och där är lägst bäst (`ascending`).

export const TOP = 10;

export type Board = {
  table: 'scores' | 'climbing_scores' | 'car_scores';
  submit: 'submit_score' | 'submit_climbing_score' | 'submit_car_score';
  max: number;
  ascending?: boolean;
};
export const FLAPPY: Board = { table: 'scores', submit: 'submit_score', max: 9999 };
export const CLIMBING: Board = { table: 'climbing_scores', submit: 'submit_climbing_score', max: 9999 };
export const CAR: Board = { table: 'car_scores', submit: 'submit_car_score', max: 999999, ascending: true };

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

// De tio bästa, och vilka namn (i gemener) som hör till den här enheten. Ett namn hör
// till samma enhet i båda spelen, så namnen räknas från båda listorna.
export async function board(db: Db, hash: string | null, list: Board = FLAPPY) {
  const top = await db
    .from(list.table)
    .select('name, score, figure, created_at')
    .order('score', { ascending: !!list.ascending })
    .order('created_at', { ascending: true })
    .limit(TOP);
  if (top.error) throw top.error;
  const entries = (top.data as Row[]).map(r => ({ name: r.name, score: r.score, figure: r.figure, at: r.created_at }));
  if (!hash) return { entries, mine: [] };
  const own = await Promise.all([FLAPPY, CLIMBING, CAR].map(l => db.from(l.table).select('name_key').eq('owner', hash)));
  const failed = own.find(r => r.error);
  if (failed?.error) throw failed.error;
  const mine = new Set(own.flatMap(r => (r.data as { name_key: string }[]).map(row => row.name_key)));
  const player = await playerName(db, hash);
  if (player) mine.add(player.toLowerCase());
  return { entries, mine: [...mine] };
}

// Namnet enheten valde första gången den spelade, eller null. Med `name` tar den det
// namnet om enheten inte har något än; är det upptaget svarar den 'taken'.
export async function claimPlayer(db: Db, hash: string, name = '') {
  const { data, error } = await db.rpc('claim_player', { p_name: name, p_owner: hash });
  if (error) throw error;
  if (typeof data === 'string' && data.startsWith('mine:')) return data.slice(5);
  return data === 'taken' ? 'taken' : null;
}
async function playerName(db: Db, hash: string) {
  const name = await claimPlayer(db, hash);
  return name === 'taken' ? null : name;
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
  if (!hash || !name || !Number.isInteger(score) || score < 1 || score > list.max) {
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
