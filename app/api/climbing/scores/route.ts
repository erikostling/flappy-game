import { CLIMBING, getBoard, postScore } from '@/lib/scores';

// Climbing Games topplista, i meter. Fungerar som Flappy Games i /api/scores:
//   GET  → { entries, mine }
//   POST { name, score, figure } → { entries, mine }, eller 409 när namnet hör till
//        en annan enhet, i något av spelen.
// Svarar 503 när Supabase inte är kopplad och 502 när databasen inte svarar.

export const dynamic = 'force-dynamic';

export const GET = (request: Request) => getBoard(request, CLIMBING);
export const POST = (request: Request) => postScore(request, CLIMBING);
