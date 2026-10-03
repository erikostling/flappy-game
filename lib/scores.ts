import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Det /api/scores och /api/scores/claim delar på.

export const TOP = 10;

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
export async function board(db: Db, hash: string | null) {
  const top = await db
    .from('scores')
    .select('name, score, figure, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(TOP);
  if (top.error) throw top.error;
  const entries = (top.data as Row[]).map(r => ({ name: r.name, score: r.score, figure: r.figure, at: r.created_at }));
  if (!hash) return { entries, mine: [] };
  const own = await db.from('scores').select('name_key').eq('owner', hash);
  if (own.error) throw own.error;
  return { entries, mine: (own.data as { name_key: string }[]).map(r => r.name_key) };
}

export const cleanName = (value: unknown) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, 12) : '';
