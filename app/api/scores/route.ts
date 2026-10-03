import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Topplistan.
//   GET  → { entries }: de tio bästa, ett namn per rad.
//   POST { name, score, figure } → { entries }: sparar resultatet om det är namnets
//        bästa och svarar med den nya listan.
// Svarar 503 när Supabase inte är kopplad och 502 när databasen inte svarar.

export const dynamic = 'force-dynamic';

const TOP = 10;
const MAX_SCORE = 9999;

type Row = { name: string; score: number; figure: string; created_at: string };
type Db = NonNullable<ReturnType<typeof supabase>>;

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'cache-control': 'no-store' } });

async function topTen(db: Db) {
  const { data, error } = await db
    .from('scores')
    .select('name, score, figure, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(TOP);
  if (error) throw error;
  return (data as Row[]).map(r => ({ name: r.name, score: r.score, figure: r.figure, at: r.created_at }));
}

export async function GET() {
  const db = supabase();
  if (!db) return json({ error: 'not_configured' }, 503);
  try {
    return json({ entries: await topTen(db) });
  } catch {
    return json({ error: 'unavailable' }, 502);
  }
}

export async function POST(request: Request) {
  const db = supabase();
  if (!db) return json({ error: 'not_configured' }, 503);

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.replace(/\s+/g, ' ').trim().slice(0, 12) : '';
  const score = Number(body?.score);
  const figure = typeof body?.figure === 'string' && /^[a-z]{1,20}$/.test(body.figure) ? body.figure : 'apa';
  if (!name || !Number.isInteger(score) || score < 1 || score > MAX_SCORE) {
    return json({ error: 'invalid' }, 400);
  }

  // submit_score behåller namnets bästa resultat; "Erik" och "erik" är samma namn.
  const { error } = await db.rpc('submit_score', { p_name: name, p_score: score, p_figure: figure });
  if (error) return json({ error: 'unavailable' }, 502);
  try {
    return json({ entries: await topTen(db) });
  } catch {
    return json({ error: 'unavailable' }, 502);
  }
}
